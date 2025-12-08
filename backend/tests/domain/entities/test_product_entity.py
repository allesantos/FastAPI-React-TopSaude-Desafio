"""
Testes unitários para ProductEntity.
Valida regras de negócio relacionadas a produtos.
"""

import pytest
from decimal import Decimal
from src.domain.entities.product import ProductEntity


class TestProductEntity:
    """Testes da entidade ProductEntity."""
    
    def test_criar_produto_valido(self, product_factory):
        """Deve criar produto válido com sucesso."""
        # Arrange & Act
        product = product_factory(
            name="Paracetamol",
            sku="MED-001",
            price=Decimal("15.00"),
            stock_qty=50
        )
        
        # Assert
        assert product.name == "Paracetamol"
        assert product.sku == "MED-001"
        assert product.price == Decimal("15.00")
        assert product.stock_qty == 50
        assert product.is_active is True
    
    def test_validar_preco_positivo(self, product_factory):
        """Deve rejeitar produto com preço negativo ou zero."""
        # Arrange
        product = product_factory(price=Decimal("-10.00"))
        
        # Act & Assert
        with pytest.raises(ValueError, match="Preço deve ser maior que zero"):
            product.validate()
    
    def test_validar_preco_zero(self, product_factory):
        """Deve rejeitar produto com preço zero."""
        # Arrange
        product = product_factory(price=Decimal("0.00"))
        
        # Act & Assert
        with pytest.raises(ValueError, match="Preço deve ser maior que zero"):
            product.validate()
    
    def test_validar_estoque_nao_negativo(self, product_factory):
        """Deve rejeitar produto com estoque negativo."""
        # Arrange
        product = product_factory(stock_qty=-5)
        
        # Act & Assert
        with pytest.raises(ValueError, match="Quantidade em estoque não pode ser negativa"):
            product.validate()
    
    def test_validar_nome_obrigatorio(self, product_factory):
        """Deve rejeitar produto sem nome."""
        # Arrange
        product = product_factory(name="")
        
        # Act & Assert
        with pytest.raises(ValueError, match="Nome do produto é obrigatório"):
            product.validate()
    
    def test_validar_sku_obrigatorio(self, product_factory):
        """Deve rejeitar produto sem SKU."""
        # Arrange
        product = product_factory(sku="")
        
        # Act & Assert
        with pytest.raises(ValueError, match="SKU é obrigatório"):
            product.validate()
    
    def test_has_sufficient_stock_com_estoque(self, product_factory):
        """Deve retornar True se houver estoque suficiente."""
        # Arrange
        product = product_factory(stock_qty=10, is_active=True)
        
        # Act
        result = product.has_sufficient_stock(5)
        
        # Assert
        assert result is True
    
    def test_has_sufficient_stock_sem_estoque(self, product_factory):
        """Deve retornar False se não houver estoque suficiente."""
        # Arrange
        product = product_factory(stock_qty=3, is_active=True)
        
        # Act
        result = product.has_sufficient_stock(5)
        
        # Assert
        assert result is False
    
    def test_has_sufficient_stock_produto_inativo(self, product_factory):
        """Deve retornar False se produto estiver inativo."""
        # Arrange
        product = product_factory(stock_qty=100, is_active=False)
        
        # Act
        result = product.has_sufficient_stock(1)
        
        # Assert
        assert result is False
    
    def test_decrease_stock_sucesso(self, product_factory):
        """Deve descontar estoque com sucesso."""
        # Arrange
        product = product_factory(stock_qty=10)
        
        # Act
        product.decrease_stock(3)
        
        # Assert
        assert product.stock_qty == 7
    
    def test_decrease_stock_insuficiente(self, product_factory):
        """Deve rejeitar desconto de estoque insuficiente."""
        # Arrange
        product = product_factory(stock_qty=3)
        
        # Act & Assert
        with pytest.raises(ValueError, match="Estoque insuficiente"):
            product.decrease_stock(5)
    
    def test_increase_stock_sucesso(self, product_factory):
        """Deve aumentar estoque com sucesso."""
        # Arrange
        product = product_factory(stock_qty=10)
        
        # Act
        product.increase_stock(5)
        
        # Assert
        assert product.stock_qty == 15
    
    def test_increase_stock_quantidade_invalida(self, product_factory):
        """Deve rejeitar aumento com quantidade zero ou negativa."""
        # Arrange
        product = product_factory(stock_qty=10)
        
        # Act & Assert
        with pytest.raises(ValueError, match="Quantidade deve ser maior que zero"):
            product.increase_stock(0)