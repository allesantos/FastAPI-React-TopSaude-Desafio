from typing import Optional
from src.application.interfaces.repositories import ICustomerRepository
from src.application.dtos.customer_dto import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerListResponse
)
from src.domain.entities.customer import CustomerEntity
from src.domain.exceptions.business_exceptions import CustomerNotFoundException
import math


class CustomerUseCases:
    """Casos de uso relacionados a clientes."""
    
    def __init__(self, customer_repository: ICustomerRepository):
        """
        Inicializa os use cases.
        
        Args:
            customer_repository: Repositório de clientes injetado
        """
        self.customer_repository = customer_repository
    
    def create_customer(self, customer_data: CustomerCreate) -> CustomerResponse:
        """
        Cria um novo cliente.
        
        Args:
            customer_data: Dados do cliente a ser criado
        
        Returns:
            CustomerResponse com dados do cliente criado
        
        Raises:
            DuplicateEmailException: Se o email já existe
            DuplicateDocumentException: Se o documento já existe
        """
        # Criar entity a partir do DTO
        customer_entity = CustomerEntity(
            id=None,
            name=customer_data.name,
            email=customer_data.email,
            document=customer_data.document
        )
        
        # Validar regras de negócio
        customer_entity.validate()
        
        # Persistir no banco
        created_customer = self.customer_repository.create(customer_entity)
        
        # Retornar DTO de resposta
        return CustomerResponse.model_validate(created_customer)
    
    def get_customer_by_id(self, customer_id: int) -> CustomerResponse:
        """
        Busca um cliente por ID.
        
        Args:
            customer_id: ID do cliente
        
        Returns:
            CustomerResponse com dados do cliente
        
        Raises:
            CustomerNotFoundException: Se o cliente não existe
        """
        customer = self.customer_repository.get_by_id(customer_id)
        
        if not customer:
            raise CustomerNotFoundException(f"Cliente com ID {customer_id} não encontrado")
        
        return CustomerResponse.model_validate(customer)
    
    def get_customer_by_email(self, email: str) -> Optional[CustomerResponse]:
        """
        Busca um cliente por email.
        
        Args:
            email: Email do cliente
        
        Returns:
            CustomerResponse se encontrado, None caso contrário
        """
        customer = self.customer_repository.get_by_email(email)
        
        if not customer:
            return None
        
        return CustomerResponse.model_validate(customer)
    
    def get_customer_by_document(self, document: str) -> Optional[CustomerResponse]:
        """
        Busca um cliente por documento.
        
        Args:
            document: Documento do cliente (CPF ou CNPJ)
        
        Returns:
            CustomerResponse se encontrado, None caso contrário
        """
        customer = self.customer_repository.get_by_document(document)
        
        if not customer:
            return None
        
        return CustomerResponse.model_validate(customer)
    
    def list_customers(
        self,
        page: int = 1,
        page_size: int = 20
    ) -> CustomerListResponse:
        """
        Lista clientes com paginação.
        
        Args:
            page: Número da página (começando em 1)
            page_size: Tamanho da página
        
        Returns:
            CustomerListResponse com lista paginada
        """
        # Calcular skip
        skip = (page - 1) * page_size
        
        # Buscar clientes
        customers, total = self.customer_repository.list_all(
            skip=skip,
            limit=page_size
        )
        
        # Calcular total de páginas
        total_pages = math.ceil(total / page_size) if total > 0 else 0
        
        # Converter entities para DTOs
        items = [CustomerResponse.model_validate(c) for c in customers]
        
        return CustomerListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    
    def update_customer(self, customer_id: int, customer_data: CustomerUpdate) -> CustomerResponse:
        """
        Atualiza um cliente existente.
        
        Args:
            customer_id: ID do cliente
            customer_data: Dados para atualizar
        
        Returns:
            CustomerResponse com dados atualizados
        
        Raises:
            CustomerNotFoundException: Se o cliente não existe
            DuplicateEmailException: Se o novo email já existe
            DuplicateDocumentException: Se o novo documento já existe
        """
        # Buscar cliente existente
        existing_customer = self.customer_repository.get_by_id(customer_id)
        
        if not existing_customer:
            raise CustomerNotFoundException(f"Cliente com ID {customer_id} não encontrado")
        
        # Atualizar apenas campos fornecidos
        update_data = customer_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(existing_customer, field, value)
        
        # Validar regras de negócio
        existing_customer.validate()
        
        # Persistir alterações
        updated_customer = self.customer_repository.update(existing_customer)
        
        return CustomerResponse.model_validate(updated_customer)
    
    def delete_customer(self, customer_id: int) -> bool:
        """
        Deleta um cliente.
        
        Args:
            customer_id: ID do cliente
        
        Returns:
            True se deletado com sucesso
        
        Raises:
            CustomerNotFoundException: Se o cliente não existe
        """
        success = self.customer_repository.delete(customer_id)
        
        if not success:
            raise CustomerNotFoundException(f"Cliente com ID {customer_id} não encontrado")
        
        return success