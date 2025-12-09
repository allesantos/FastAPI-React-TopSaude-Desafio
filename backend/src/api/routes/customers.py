"""
Rotas da API de Clientes.
Define os endpoints HTTP para gerenciamento de clientes.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from src.infrastructure.database.connection import get_db
from src.api.dependencies import get_customer_repository
from src.api.response_envelope import success_response, error_response, ResponseEnvelope
from src.application.use_cases.customer_use_cases import CustomerUseCases
from src.application.dtos.customer_dto import CustomerCreate, CustomerUpdate
from src.domain.exceptions.business_exceptions import (
    CustomerNotFoundException,
    DuplicateEmailException,
    DuplicateDocumentException,
    BusinessException
)


router = APIRouter(
    prefix="/customers",
    tags=["Clientes"]
)


@router.post(
    "",
    response_model=ResponseEnvelope,
    status_code=status.HTTP_201_CREATED,
    summary="Criar novo cliente",
    description="Cria um novo cliente"
)
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):
    """
    Cria um novo cliente.
    
    - **name**: Nome do cliente (obrigatório)
    - **email**: Email do cliente (obrigatório, único)
    - **document**: CPF (11 dígitos) ou CNPJ (14 dígitos) (obrigatório, único)
    """
    try:
        customer_repo = get_customer_repository(db)
        use_cases = CustomerUseCases(customer_repo)
        
        created_customer = use_cases.create_customer(customer)
        
        return success_response(
            message="Cliente criado com sucesso",
            data=created_customer.model_dump()
        )
    
    except DuplicateEmailException as e:
        return error_response(message=str(e))
    
    except DuplicateDocumentException as e:
        return error_response(message=str(e))
    
    except BusinessException as e:
        return error_response(message=str(e))
    
    except Exception as e:
        return error_response(message=f"Erro ao criar cliente: {str(e)}")


@router.get(
    "",
    response_model=ResponseEnvelope,
    summary="Listar clientes",
    description="Lista clientes com paginação e filtros de busca (nome, email, documento)"
)
def list_customers(
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(20, ge=1, le=100, description="Tamanho da página"),
    
    name: Optional[str] = Query(None, description="Filtrar por nome (busca parcial)"),
    email: Optional[str] = Query(None, description="Filtrar por email (busca parcial)"),
    document: Optional[str] = Query(None, description="Filtrar por documento (CPF/CNPJ)"), 
    db: Session = Depends(get_db)   
):
    """
    Lista todos os clientes com suporte a:
    
    - **Paginação**: page e page_size
    - **Filtros**: name, email, document (opcionais)
    """
    try:
        customer_repo = get_customer_repository(db)
        use_cases = CustomerUseCases(customer_repo)
        
        # ⚠️ Passamos os novos filtros para o Use Case
        result = use_cases.list_customers(
            page=page,
            page_size=page_size,
            name=name,       
            email=email,
            document=document
        )
        
        return success_response(
            message="Clientes listados com sucesso",
            data=result.model_dump()
        )
    
    except Exception as e:
        return error_response(message=f"Erro ao listar clientes: {str(e)}")


@router.get(
    "/{customer_id}",
    response_model=ResponseEnvelope,
    summary="Buscar cliente por ID",
    description="Retorna os detalhes de um cliente específico"
)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """
    Busca um cliente pelo ID.
    
    - **customer_id**: ID do cliente (obrigatório)
    """
    try:
        customer_repo = get_customer_repository(db)
        use_cases = CustomerUseCases(customer_repo)
        
        customer = use_cases.get_customer_by_id(customer_id)
        
        return success_response(
            message="Cliente encontrado",
            data=customer.model_dump()
        )
    
    except CustomerNotFoundException as e:
        return error_response(message=str(e))
    
    except Exception as e:
        return error_response(message=f"Erro ao buscar cliente: {str(e)}")


@router.get(
    "/email/{email}",
    response_model=ResponseEnvelope,
    summary="Buscar cliente por email",
    description="Retorna os detalhes de um cliente pelo email"
)
def get_customer_by_email(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Busca um cliente pelo email.
    
    - **email**: Email do cliente (obrigatório)
    """
    try:
        customer_repo = get_customer_repository(db)
        use_cases = CustomerUseCases(customer_repo)
        
        customer = use_cases.get_customer_by_email(email)
        
        if not customer:
            return error_response(message=f"Cliente com email '{email}' não encontrado")
        
        return success_response(
            message="Cliente encontrado",
            data=customer.model_dump()
        )
    
    except Exception as e:
        return error_response(message=f"Erro ao buscar cliente: {str(e)}")


@router.get(
    "/document/{document}",
    response_model=ResponseEnvelope,
    summary="Buscar cliente por documento",
    description="Retorna os detalhes de um cliente pelo CPF ou CNPJ"
)
def get_customer_by_document(
    document: str,
    db: Session = Depends(get_db)
):
    """
    Busca um cliente pelo documento (CPF ou CNPJ).
    
    - **document**: CPF ou CNPJ do cliente (obrigatório)
    """
    try:
        customer_repo = get_customer_repository(db)
        use_cases = CustomerUseCases(customer_repo)
        
        customer = use_cases.get_customer_by_document(document)
        
        if not customer:
            return error_response(message=f"Cliente com documento '{document}' não encontrado")
        
        return success_response(
            message="Cliente encontrado",
            data=customer.model_dump()
        )
    
    except Exception as e:
        return error_response(message=f"Erro ao buscar cliente: {str(e)}")


@router.put(
    "/{customer_id}",
    response_model=ResponseEnvelope,
    summary="Atualizar cliente",
    description="Atualiza os dados de um cliente existente"
)
def update_customer(
    customer_id: int,
    customer: CustomerUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza um cliente existente.
    
    - **customer_id**: ID do cliente (obrigatório)
    - Todos os campos do body são opcionais
    - Apenas os campos fornecidos serão atualizados
    """
    try:
        customer_repo = get_customer_repository(db)
        use_cases = CustomerUseCases(customer_repo)
        
        updated_customer = use_cases.update_customer(customer_id, customer)
        
        return success_response(
            message="Cliente atualizado com sucesso",
            data=updated_customer.model_dump()
        )
    
    except CustomerNotFoundException as e:
        return error_response(message=str(e))
    
    except DuplicateEmailException as e:
        return error_response(message=str(e))
    
    except DuplicateDocumentException as e:
        return error_response(message=str(e))
    
    except BusinessException as e:
        return error_response(message=str(e))
    
    except Exception as e:
        return error_response(message=f"Erro ao atualizar cliente: {str(e)}")


@router.delete(
    "/{customer_id}",
    response_model=ResponseEnvelope,
    summary="Deletar cliente",
    description="Deleta um cliente"
)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """
    Deleta um cliente.
    
    - **customer_id**: ID do cliente (obrigatório)
    """
    try:
        customer_repo = get_customer_repository(db)
        use_cases = CustomerUseCases(customer_repo)
        
        use_cases.delete_customer(customer_id)
        
        return success_response(
            message="Cliente deletado com sucesso",
            data={"id": customer_id}
        )
    
    except CustomerNotFoundException as e:
        return error_response(message=str(e))
    
    except Exception as e:
        return error_response(message=f"Erro ao deletar cliente: {str(e)}")