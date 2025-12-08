"""
Rotas da API de Produtos.
Define os endpoints HTTP para gerenciamento de produtos.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from src.infrastructure.database.connection import get_db
from src.api.dependencies import get_product_repository
from src.api.response_envelope import success_response, error_response, ResponseEnvelope
from src.application.use_cases.product_use_cases import ProductUseCases
from src.application.dtos.product_dto import ProductCreate, ProductUpdate
from src.domain.exceptions.business_exceptions import (
    ProductNotFoundException,
    DuplicateSKUException,
    BusinessException
)


router = APIRouter(
    prefix="/products",
    tags=["Produtos"]
)


@router.post(
    "",
    response_model=ResponseEnvelope,
    status_code=status.HTTP_201_CREATED,
    summary="Criar novo produto",
    description="Cria um novo produto no catálogo"
)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    """
    Cria um novo produto.
    
    - **name**: Nome do produto (obrigatório)
    - **sku**: SKU único do produto (obrigatório)
    - **price**: Preço do produto (obrigatório, maior que zero)
    - **stock_qty**: Quantidade em estoque (obrigatório, maior ou igual a zero)
    - **is_active**: Produto ativo (padrão: true)
    """
    try:
        product_repo = get_product_repository(db)
        use_cases = ProductUseCases(product_repo)
        
        created_product = use_cases.create_product(product)
        
        return success_response(
            message="Produto criado com sucesso",
            data=created_product.model_dump()
        )
    
    except DuplicateSKUException as e:
        return error_response(message=str(e))
    
    except BusinessException as e:
        return error_response(message=str(e))
    
    except Exception as e:
        return error_response(message=f"Erro ao criar produto: {str(e)}")


@router.get(
    "",
    response_model=ResponseEnvelope,
    summary="Listar produtos",
    description="Lista produtos com paginação, filtros e ordenação"
)
def list_products(
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(20, ge=1, le=100, description="Tamanho da página"),
    is_active: Optional[bool] = Query(None, description="Filtrar por status ativo/inativo"),
    name: Optional[str] = Query(None, description="Filtrar por nome (busca parcial)"),
    sku: Optional[str] = Query(None, description="Filtrar por SKU (busca parcial)"),
    order_by: str = Query("created_at", description="Campo para ordenação"),
    order_direction: str = Query("desc", pattern="^(asc|desc)$", description="Direção da ordenação"),
    db: Session = Depends(get_db)
):
    """
    Lista todos os produtos com suporte a:
    
    - **Paginação**: page e page_size
    - **Filtros**: is_active, name (parcial), sku (parcial)
    - **Ordenação**: order_by (created_at, name, price, stock_qty) e order_direction (asc, desc)
    """
    try:
        product_repo = get_product_repository(db)
        use_cases = ProductUseCases(product_repo)
        
        result = use_cases.list_products(
            page=page,
            page_size=page_size,
            is_active=is_active,
            name_filter=name,
            sku_filter=sku,
            order_by=order_by,
            order_direction=order_direction
        )
        
        return success_response(
            message="Produtos listados com sucesso",
            data=result.model_dump()
        )
    
    except Exception as e:
        return error_response(message=f"Erro ao listar produtos: {str(e)}")


@router.get(
    "/{product_id}",
    response_model=ResponseEnvelope,
    summary="Buscar produto por ID",
    description="Retorna os detalhes de um produto específico"
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Busca um produto pelo ID.
    
    - **product_id**: ID do produto (obrigatório)
    """
    try:
        product_repo = get_product_repository(db)
        use_cases = ProductUseCases(product_repo)
        
        product = use_cases.get_product_by_id(product_id)
        
        return success_response(
            message="Produto encontrado",
            data=product.model_dump()
        )
    
    except ProductNotFoundException as e:
        return error_response(message=str(e))
    
    except Exception as e:
        return error_response(message=f"Erro ao buscar produto: {str(e)}")


@router.put(
    "/{product_id}",
    response_model=ResponseEnvelope,
    summary="Atualizar produto",
    description="Atualiza os dados de um produto existente"
)
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza um produto existente.
    
    - **product_id**: ID do produto (obrigatório)
    - Todos os campos do body são opcionais
    - Apenas os campos fornecidos serão atualizados
    """
    try:
        product_repo = get_product_repository(db)
        use_cases = ProductUseCases(product_repo)
        
        updated_product = use_cases.update_product(product_id, product)
        
        return success_response(
            message="Produto atualizado com sucesso",
            data=updated_product.model_dump()
        )
    
    except ProductNotFoundException as e:
        return error_response(message=str(e))
    
    except DuplicateSKUException as e:
        return error_response(message=str(e))
    
    except BusinessException as e:
        return error_response(message=str(e))
    
    except Exception as e:
        return error_response(message=f"Erro ao atualizar produto: {str(e)}")


@router.delete(
    "/{product_id}",
    response_model=ResponseEnvelope,
    summary="Deletar produto",
    description="Deleta um produto (soft delete - apenas marca como inativo)"
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Deleta um produto (soft delete).
    
    - **product_id**: ID do produto (obrigatório)
    - O produto não é removido do banco, apenas marcado como inativo
    """
    try:
        product_repo = get_product_repository(db)
        use_cases = ProductUseCases(product_repo)
        
        use_cases.delete_product(product_id)
        
        return success_response(
            message="Produto deletado com sucesso",
            data={"id": product_id, "is_active": False}
        )
    
    except ProductNotFoundException as e:
        return error_response(message=str(e))
    
    except Exception as e:
        return error_response(message=f"Erro ao deletar produto: {str(e)}")