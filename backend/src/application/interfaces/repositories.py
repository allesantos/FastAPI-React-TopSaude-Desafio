from abc import ABC, abstractmethod
from typing import List, Optional
from src.domain.entities.product import ProductEntity
from src.domain.entities.customer import CustomerEntity
from src.domain.entities.order import OrderEntity


class IProductRepository(ABC):
    """Interface do repositório de produtos."""
    
    @abstractmethod
    def create(self, product: ProductEntity) -> ProductEntity:
        """Cria um novo produto."""
        pass
    
    @abstractmethod
    def get_by_id(self, product_id: int) -> Optional[ProductEntity]:
        """Busca produto por ID."""
        pass
    
    @abstractmethod
    def get_by_sku(self, sku: str) -> Optional[ProductEntity]:
        """Busca produto por SKU."""
        pass
    
    @abstractmethod
    def list_all(self, skip: int = 0, limit: int = 20, is_active: Optional[bool] = None) -> List[ProductEntity]:
        """Lista produtos com paginação e filtros."""
        pass
    
    @abstractmethod
    def update(self, product: ProductEntity) -> ProductEntity:
        """Atualiza um produto."""
        pass
    
    @abstractmethod
    def delete(self, product_id: int) -> bool:
        """Deleta um produto (soft delete)."""
        pass


class ICustomerRepository(ABC):
    """Interface do repositório de clientes."""
    
    @abstractmethod
    def create(self, customer: CustomerEntity) -> CustomerEntity:
        """Cria um novo cliente."""
        pass
    
    @abstractmethod
    def get_by_id(self, customer_id: int) -> Optional[CustomerEntity]:
        """Busca cliente por ID."""
        pass
    
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[CustomerEntity]:
        """Busca cliente por email."""
        pass
    
    @abstractmethod
    def get_by_document(self, document: str) -> Optional[CustomerEntity]:
        """Busca cliente por documento."""
        pass
    
    @abstractmethod
    def list_all(self, skip: int = 0, limit: int = 20) -> List[CustomerEntity]:
        """Lista clientes com paginação."""
        pass
    
    @abstractmethod
    def update(self, customer: CustomerEntity) -> CustomerEntity:
        """Atualiza um cliente."""
        pass
    
    @abstractmethod
    def delete(self, customer_id: int) -> bool:
        """Deleta um cliente (soft delete)."""
        pass


class IOrderRepository(ABC):
    """Interface do repositório de pedidos."""
    
    @abstractmethod
    def create(self, order: OrderEntity) -> OrderEntity:
        """Cria um novo pedido."""
        pass
    
    @abstractmethod
    def get_by_id(self, order_id: int) -> Optional[OrderEntity]:
        """Busca pedido por ID."""
        pass
    
    @abstractmethod
    def get_by_idempotency_key(self, idempotency_key: str) -> Optional[OrderEntity]:
        """Busca pedido por chave de idempotência."""
        pass
    
    @abstractmethod
    def list_all(self, skip: int = 0, limit: int = 20, customer_id: Optional[int] = None) -> List[OrderEntity]:
        """Lista pedidos com paginação e filtros."""
        pass
    
    @abstractmethod
    def update(self, order: OrderEntity) -> OrderEntity:
        """Atualiza um pedido."""
        pass