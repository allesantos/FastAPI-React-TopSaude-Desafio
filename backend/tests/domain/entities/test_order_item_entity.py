"""
Testes unitários para OrderItemEntity.
Valida regras de negócio relacionadas a itens de pedidos.
"""

import pytest
from decimal import Decimal
from src.domain.entities.order_item import OrderItemEntity


class TestOrderItemEntity:
    """Testes da entidade OrderItemEntity."""
    
    def test_criar_order_item_valido(self, order_item_factory):
        """Deve criar item de pedido válido com sucesso."""
        # Arrange & Act
        item = order_item_factory(
            product_id=1,
            unit_price=Decimal("10.00"),
            quantity=3
        )
        
        # Assert
        assert item.product_id == 1
        assert item.unit_price == Decimal("10.00")
        assert item.quantity == 3
        assert item.line_total == Decimal("30.00")
    
    def test_calculate_line_total(self, order_item_factory):
        """Deve calcular line_total corretamente."""
        # Arrange
        item = order_item_factory(
            unit_price=Decimal("12.50"),
            quantity=4
        )
        
        # Act
        total = item.calculate_line_total()
        
        # Assert
        assert total == Decimal("50.00")
    
    def test_validar_product_id_invalido(self, order_item_factory):
        """Deve rejeitar item com product_id inválido."""
        # Arrange
        item = order_item_factory(product_id=0)
        
        # Act & Assert
        with pytest.raises(ValueError, match="ID do produto deve ser maior que zero"):
            item.validate()
    
    def test_validar_unit_price_zero(self, order_item_factory):
        """Deve rejeitar item com preço zero."""
        # Arrange
        item = order_item_factory(unit_price=Decimal("0.00"))
        
        # Act & Assert
        with pytest.raises(ValueError, match="Preço unitário deve ser maior que zero"):
            item.validate()
    
    def test_validar_quantity_zero(self, order_item_factory):
        """Deve rejeitar item com quantidade zero."""
        # Arrange
        item = order_item_factory(quantity=0)
        
        # Act & Assert
        with pytest.raises(ValueError, match="Quantidade deve ser maior que zero"):
            item.validate()
    
    def test_validar_line_total_incorreto(self, order_item_factory):
        """Deve rejeitar item com line_total incorreto."""
        # Arrange
        item = order_item_factory(
            unit_price=Decimal("10.00"),
            quantity=3,
            line_total=Decimal("99.99")  # Incorreto! Deveria ser 30.00
        )
        
        # Act & Assert
        with pytest.raises(ValueError, match="Total da linha incorreto"):
            item.validate()
    
    def test_update_quantity(self, order_item_factory):
        """Deve atualizar quantidade e recalcular line_total."""
        # Arrange
        item = order_item_factory(
            unit_price=Decimal("10.00"),
            quantity=2
        )
        
        # Act
        item.update_quantity(5)
        
        # Assert
        assert item.quantity == 5
        assert item.line_total == Decimal("50.00")