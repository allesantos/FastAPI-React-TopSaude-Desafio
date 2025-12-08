"""
Fixtures globais para testes.
Contém factories para criar entidades de teste facilmente.
"""

import pytest
from datetime import datetime
from decimal import Decimal
from unittest.mock import MagicMock, Mock
from typing import List

from src.domain.entities.product import ProductEntity
from src.domain.entities.customer import CustomerEntity
from src.domain.entities.order import OrderEntity
from src.domain.entities.order_item import OrderItemEntity
from src.application.interfaces.repositories import (
    IProductRepository,
    ICustomerRepository,
    IOrderRepository
)
from src.core.constants import OrderStatus


# ==========================================
# FACTORIES DE ENTITIES
# ==========================================

@pytest.fixture
def product_factory():
    """
    Factory para criar ProductEntity de teste.
    
    Uso:
        product = product_factory()
        product_custom = product_factory(price=Decimal("99.99"), stock_qty=0)
    """
    def _create_product(
        id: int = 1,
        name: str = "Produto Teste",
        sku: str = "TEST-001",
        price: Decimal = Decimal("10.00"),
        stock_qty: int = 100,
        is_active: bool = True
    ) -> ProductEntity:
        return ProductEntity(
            id=id,
            name=name,
            sku=sku,
            price=price,
            stock_qty=stock_qty,
            is_active=is_active,
            created_at=datetime.now(),
            updated_at=None
        )
    return _create_product


@pytest.fixture
def customer_factory():
    """
    Factory para criar CustomerEntity de teste.
    
    Uso:
        customer = customer_factory()
        customer_inactive = customer_factory(is_active=False)
    """
    def _create_customer(
        id: int = 1,
        name: str = "Cliente Teste",
        email: str = "teste@email.com",
        document: str = "12345678900",
        is_active: bool = True
    ) -> CustomerEntity:
        return CustomerEntity(
            id=id,
            name=name,
            email=email,
            document=document,
            is_active=is_active,
            created_at=datetime.now(),
            updated_at=None
        )
    return _create_customer


@pytest.fixture
def order_item_factory():
    """
    Factory para criar OrderItemEntity de teste.
    
    Uso:
        item = order_item_factory()
        item_custom = order_item_factory(quantity=5, unit_price=Decimal("20.00"))
    """
    def _create_order_item(
        id: int = 1,
        order_id: int = 1,
        product_id: int = 1,
        unit_price: Decimal = Decimal("10.00"),
        quantity: int = 2,
        line_total: Decimal = None
    ) -> OrderItemEntity:
        if line_total is None:
            line_total = unit_price * Decimal(quantity)
        
        return OrderItemEntity(
            id=id,
            order_id=order_id,
            product_id=product_id,
            unit_price=unit_price,
            quantity=quantity,
            line_total=line_total
        )
    return _create_order_item


@pytest.fixture
def order_factory(order_item_factory):
    """
    Factory para criar OrderEntity de teste.
    
    Uso:
        order = order_factory()
        order_with_items = order_factory(items=[item1, item2])
    """
    def _create_order(
        id: int = 1,
        customer_id: int = 1,
        total_amount: Decimal = Decimal("20.00"),
        status: str = OrderStatus.CREATED.value,
        idempotency_key: str = "test-key-123",
        items: List[OrderItemEntity] = None
    ) -> OrderEntity:
        if items is None:
            # Criar 2 itens padrão
            items = [
                order_item_factory(id=1, order_id=id, product_id=1, quantity=2),
                order_item_factory(id=2, order_id=id, product_id=2, quantity=1)
            ]
        
        return OrderEntity(
            id=id,
            customer_id=customer_id,
            total_amount=total_amount,
            status=status,
            idempotency_key=idempotency_key,
            created_at=datetime.now(),
            updated_at=None,
            items=items
        )
    return _create_order


# ==========================================
# MOCKS DE REPOSITORIES
# ==========================================

@pytest.fixture
def mock_product_repository():
    """
    Mock do IProductRepository.
    
    Uso:
        mock_repo = mock_product_repository
        mock_repo.get_by_id.return_value = product
    """
    mock = MagicMock(spec=IProductRepository)
    return mock


@pytest.fixture
def mock_customer_repository():
    """
    Mock do ICustomerRepository.
    
    Uso:
        mock_repo = mock_customer_repository
        mock_repo.get_by_id.return_value = customer
    """
    mock = MagicMock(spec=ICustomerRepository)
    return mock


@pytest.fixture
def mock_order_repository():
    """
    Mock do IOrderRepository.
    
    Uso:
        mock_repo = mock_order_repository
        mock_repo.create.return_value = order
    """
    mock = MagicMock(spec=IOrderRepository)
    return mock


@pytest.fixture
def mock_db_session():
    """
    Mock da sessão do banco de dados.
    
    Uso:
        mock_db = mock_db_session
        mock_db.commit.assert_called_once()
    """
    mock = MagicMock()
    mock.commit = MagicMock()
    mock.rollback = MagicMock()
    mock.flush = MagicMock()
    mock.refresh = MagicMock()
    return mock