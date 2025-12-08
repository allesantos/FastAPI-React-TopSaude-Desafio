"""
Entidade Order do domínio.
Representa a lógica de negócio de um pedido.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, TYPE_CHECKING
from src.core.constants import OrderStatus

if TYPE_CHECKING:
    from src.domain.entities.order_item import OrderItemEntity


class OrderEntity:
    """
    Entidade de Pedido.
    Contém regras de negócio relacionadas a pedidos.
    """
    
    def __init__(
        self,
        id: Optional[int],
        customer_id: int,
        total_amount: Decimal,
        status: str = OrderStatus.CREATED.value,
        idempotency_key: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        items: Optional[List['OrderItemEntity']] = None
    ):
        self.id = id
        self.customer_id = customer_id
        self.total_amount = total_amount
        self.status = status
        self.idempotency_key = idempotency_key
        self.created_at = created_at
        self.updated_at = updated_at
        self.items = items or []
    
    def validate(self) -> None:
        """Valida regras de negócio do pedido."""
        if self.customer_id <= 0:
            raise ValueError("ID do cliente deve ser maior que zero")
        
        if self.total_amount < 0:
            raise ValueError("Valor total não pode ser negativo")
        
        if self.status not in [s.value for s in OrderStatus]:
            raise ValueError(f"Status inválido: {self.status}")
        
        if not self.items or len(self.items) == 0:
            raise ValueError("Pedido deve conter ao menos um item")
    
    def calculate_total(self) -> Decimal:
        """Calcula o total do pedido com base nos itens."""
        return sum(item.line_total for item in self.items)
    
    def add_item(self, item: 'OrderItemEntity') -> None:
        """Adiciona um item ao pedido."""
        self.items.append(item)
        self.total_amount = self.calculate_total()
    
    def can_be_cancelled(self) -> bool:
        """Verifica se o pedido pode ser cancelado."""
        return self.status in [OrderStatus.CREATED.value]
    
    def cancel(self) -> None:
        """Cancela o pedido."""
        if not self.can_be_cancelled():
            raise ValueError(f"Pedido com status {self.status} não pode ser cancelado")
        self.status = OrderStatus.CANCELLED.value
    
    def mark_as_paid(self) -> None:
        """Marca o pedido como pago."""
        if self.status != OrderStatus.CREATED.value:
            raise ValueError(f"Apenas pedidos criados podem ser marcados como pagos")
        self.status = OrderStatus.PAID.value