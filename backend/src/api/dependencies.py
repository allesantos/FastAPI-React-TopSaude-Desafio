"""
Dependências para injeção no FastAPI.
Configura as instâncias dos repositórios e serviços.
"""
from sqlalchemy.orm import Session
from fastapi import Depends

from src.infrastructure.database.connection import get_db

# Repositórios
from src.infrastructure.repositories.product_repository import ProductRepository
from src.infrastructure.repositories.customer_repository import CustomerRepository
from src.infrastructure.repositories.order_repository import OrderRepository

# Interfaces
from src.application.interfaces.repositories import (
    IProductRepository,
    ICustomerRepository,
    IOrderRepository
)

# Use Cases
from src.application.use_cases.order_use_cases import OrderUseCases 


# --- Funções de Injeção de Dependência para Repositórios ---

def get_product_repository(db: Session = Depends(get_db)) -> IProductRepository:
    """
    Retorna instância do repositório de produtos.
    """
    return ProductRepository(db)


def get_customer_repository(db: Session = Depends(get_db)) -> ICustomerRepository:
    """
    Retorna instância do repositório de clientes.
    """
    return CustomerRepository(db)


def get_order_repository(db: Session = Depends(get_db)) -> IOrderRepository:
    """
    Retorna instância do repositório de pedidos.
    """
    return OrderRepository(db)


# --- Função de Injeção de Dependência para Use Cases ---

def get_order_use_cases(
    db: Session = Depends(get_db),
    # Use as dependências de repositório já definidas, se quiser
    # Isso melhora a clareza e reusabilidade
) -> OrderUseCases:
    """
    Cria instância de OrderUseCases com todas as dependências.
    """
    # As classes OrderRepository, ProductRepository, CustomerRepository já estão importadas.
    
    order_repo = OrderRepository(db)
    product_repo = ProductRepository(db)
    customer_repo = CustomerRepository(db)
    
    return OrderUseCases(
        order_repository=order_repo,
        product_repository=product_repo,
        customer_repository=customer_repo,
        db=db # Verifique se OrderUseCases realmente precisa de 'db'
    )