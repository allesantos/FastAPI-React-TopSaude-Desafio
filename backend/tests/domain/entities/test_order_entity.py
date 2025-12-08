"""
Testes unitários para OrderEntity.
Valida regras de negócio relacionadas a pedidos.
"""

import pytest
from decimal import Decimal
from src.domain.entities.order import OrderEntity
from src.core.constants import OrderStatus


class TestOrderEntity:
    """Testes da entidade OrderEntity."""
    
    def test_criar_order_valido(self, order_factory):
        """Deve criar pedido válido com sucesso."""
        # Arrange & Act
        order = order_factory(
            customer_id=1,
            total_amount=Decimal("100.00"),
            status=OrderStatus.CREATED.value
        )
        
        # Assert
        assert order.customer_id == 1
        assert order.total_amount == Decimal("100.00")
        assert order.status == OrderStatus.CREATED.value
        assert len(order.items) == 2  # Factory cria 2 itens padrão
    
    def test_validar_customer_id_invalido(self, order_factory):
        """Deve rejeitar pedido com customer_id inválido."""
        # Arrange
        order = order_factory(customer_id=0)
        
        # Act & Assert
        with pytest.raises(ValueError, match="ID do cliente deve ser maior que zero"):
            order.validate()
    
    def test_validar_total_amount_negativo(self, order_factory):
        """Deve rejeitar pedido com total negativo."""
        # Arrange
        order = order_factory(total_amount=Decimal("-10.00"))
        
        # Act & Assert
        with pytest.raises(ValueError, match="Valor total não pode ser negativo"):
            order.validate()
    
    def test_validar_status_invalido(self, order_factory):
        """Deve rejeitar pedido com status inválido."""
        # Arrange
        order = order_factory(status="STATUS_INVALIDO")
        
        # Act & Assert
        with pytest.raises(ValueError, match="Status inválido"):
            order.validate()
    
    def test_validar_pedido_sem_itens(self, order_factory):
        """Deve rejeitar pedido sem itens."""
        # Arrange
        order = order_factory(items=[])
        
        # Act & Assert
        with pytest.raises(ValueError, match="Pedido deve conter ao menos um item"):
            order.validate()
    
    def test_calculate_total(self, order_factory, order_item_factory):
        """Deve calcular total do pedido corretamente."""
        # Arrange
        items = [
            order_item_factory(unit_price=Decimal("10.00"), quantity=2),  # 20.00
            order_item_factory(unit_price=Decimal("15.00"), quantity=3)   # 45.00
        ]
        order = order_factory(items=items)
        
        # Act
        total = order.calculate_total()
        
        # Assert
        assert total == Decimal("65.00")
    
    def test_add_item(self, order_factory, order_item_factory):
        """Deve adicionar item e recalcular total."""
        # Arrange
        order = order_factory(items=[], total_amount=Decimal("0.00"))
        new_item = order_item_factory(unit_price=Decimal("25.00"), quantity=2)
        
        # Act
        order.add_item(new_item)
        
        # Assert
        assert len(order.items) == 1
        assert order.total_amount == Decimal("50.00")
    
    def test_can_be_cancelled_status_created(self, order_factory):
        """Deve permitir cancelamento de pedido CREATED."""
        # Arrange
        order = order_factory(status=OrderStatus.CREATED.value)
        
        # Act
        result = order.can_be_cancelled()
        
        # Assert
        assert result is True
    
    def test_cancel_pedido(self, order_factory):
        """Deve cancelar pedido com sucesso."""
        # Arrange
        order = order_factory(status=OrderStatus.CREATED.value)
        
        # Act
        order.cancel()
        
        # Assert
        assert order.status == OrderStatus.CANCELLED.value
    
    def test_mark_as_paid(self, order_factory):
        """Deve marcar pedido como pago."""
        # Arrange
        order = order_factory(status=OrderStatus.CREATED.value)
        
        # Act
        order.mark_as_paid()
        
        # Assert
        assert order.status == OrderStatus.PAID.value