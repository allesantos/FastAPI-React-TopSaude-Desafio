"""
Entidade Product do domínio.
Representa a lógica de negócio de um produto.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional


class ProductEntity:
    """
    Entidade de Produto.
    Contém regras de negócio relacionadas a produtos.
    """
    
    def __init__(
        self,
        id: Optional[int],
        name: str,
        sku: str,
        price: Decimal,
        stock_qty: int,
        is_active: bool = True,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.id = id
        self.name = name
        self.sku = sku
        self.price = price
        self.stock_qty = stock_qty
        self.is_active = is_active
        self.created_at = created_at
        self.updated_at = updated_at
    
    def validate(self) -> None:
        """Valida regras de negócio do produto."""
        if not self.name or len(self.name.strip()) == 0:
            raise ValueError("Nome do produto é obrigatório")
        
        if not self.sku or len(self.sku.strip()) == 0:
            raise ValueError("SKU é obrigatório")
        
        if self.price <= 0:
            raise ValueError("Preço deve ser maior que zero")
        
        if self.stock_qty < 0:
            raise ValueError("Quantidade em estoque não pode ser negativa")
    
    def has_sufficient_stock(self, quantity: int) -> bool:
        """Verifica se há estoque suficiente."""
        return self.is_active and self.stock_qty >= quantity
    
    def decrease_stock(self, quantity: int) -> None:
        """Diminui o estoque."""
        if not self.has_sufficient_stock(quantity):
            raise ValueError(f"Estoque insuficiente. Disponível: {self.stock_qty}, Solicitado: {quantity}")
        self.stock_qty -= quantity
    
    def increase_stock(self, quantity: int) -> None:
        """Aumenta o estoque."""
        if quantity <= 0:
            raise ValueError("Quantidade deve ser maior que zero")
        self.stock_qty += quantity