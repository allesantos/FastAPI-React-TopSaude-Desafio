"""
Entidade OrderItem do domínio.
Representa a lógica de negócio de um item do pedido.
"""
from decimal import Decimal
from typing import Optional


class OrderItemEntity:
    """
    Entidade de Item do Pedido.
    Contém regras de negócio relacionadas a itens de pedidos.
    """
    
    def __init__(
        self,
        id: Optional[int],
        order_id: Optional[int],
        product_id: int,
        unit_price: Decimal,
        quantity: int,
        line_total: Optional[Decimal] = None
    ):
        self.id = id
        self.order_id = order_id
        self.product_id = product_id
        self.unit_price = unit_price
        self.quantity = quantity
        self.line_total = line_total or self.calculate_line_total()
    
    def validate(self) -> None:
        """Valida regras de negócio do item."""
        if self.product_id <= 0:
            raise ValueError("ID do produto deve ser maior que zero")
        
        if self.unit_price <= 0:
            raise ValueError("Preço unitário deve ser maior que zero")
        
        if self.quantity <= 0:
            raise ValueError("Quantidade deve ser maior que zero")
        
        # Valida se o line_total está correto
        expected_total = self.calculate_line_total()
        if self.line_total != expected_total:
            raise ValueError(f"Total da linha incorreto. Esperado: {expected_total}, Recebido: {self.line_total}")
    
    def calculate_line_total(self) -> Decimal:
        """Calcula o total da linha (preço unitário * quantidade)."""
        return self.unit_price * Decimal(self.quantity)
    
    def update_quantity(self, new_quantity: int) -> None:
        """Atualiza a quantidade e recalcula o total."""
        if new_quantity <= 0:
            raise ValueError("Quantidade deve ser maior que zero")
        
        self.quantity = new_quantity
        self.line_total = self.calculate_line_total()