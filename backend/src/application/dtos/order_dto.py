"""
DTOs (Data Transfer Objects) para Order e OrderItem.
Responsável por validar e transferir dados entre camadas.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from src.core.constants import OrderStatus


# ==========================================
# DTOs de OrderItem (Item do Pedido)
# ==========================================

class OrderItemCreate(BaseModel):
    """
    DTO para criação de um item do pedido.
    Usado quando o cliente envia os produtos que quer comprar.
    """
    product_id: int = Field(..., description="ID do produto", gt=0)
    quantity: int = Field(..., description="Quantidade do produto", gt=0)

    @field_validator("quantity")
    @classmethod
    def validar_quantidade_positiva(cls, valor: int) -> int:
        """Valida que a quantidade é maior que zero."""
        if valor <= 0:
            raise ValueError("A quantidade deve ser maior que zero")
        return valor

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "product_id": 1,
                    "quantity": 3
                }
            ]
        }
    }


class OrderItemResponse(BaseModel):
    """
    DTO para resposta de um item do pedido.
    Inclui todos os dados do item, incluindo preço e totais.
    """
    id: int = Field(..., description="ID do item do pedido")
    order_id: int = Field(..., description="ID do pedido pai")
    product_id: int = Field(..., description="ID do produto")
    unit_price: float = Field(..., description="Preço unitário no momento da compra")
    quantity: int = Field(..., description="Quantidade comprada")
    line_total: float = Field(..., description="Total da linha (unit_price * quantity)")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": 1,
                    "order_id": 1,
                    "product_id": 5,
                    "unit_price": 12.50,
                    "quantity": 3,
                    "line_total": 37.50
                }
            ]
        }
    }


# ==========================================
# DTOs de Order (Pedido)
# ==========================================

class OrderCreate(BaseModel):
    """
    DTO para criação de um pedido.
    Contém o ID do cliente e a lista de itens a serem comprados.
    """
    customer_id: int = Field(..., description="ID do cliente que está fazendo o pedido", gt=0)
    items: List[OrderItemCreate] = Field(..., description="Lista de itens do pedido", min_length=1)

    @field_validator("items")
    @classmethod
    def validar_lista_itens_nao_vazia(cls, valor: List[OrderItemCreate]) -> List[OrderItemCreate]:
        """Valida que a lista de itens não está vazia."""
        if not valor or len(valor) == 0:
            raise ValueError("O pedido deve ter pelo menos um item")
        return valor

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "customer_id": 1,
                    "items": [
                        {"product_id": 1, "quantity": 2},
                        {"product_id": 3, "quantity": 1}
                    ]
                }
            ]
        }
    }


class OrderResponse(BaseModel):
    """
    DTO para resposta de um pedido completo.
    Inclui todos os dados do pedido e seus itens.
    """
    id: int = Field(..., description="ID do pedido")
    customer_id: int = Field(..., description="ID do cliente")
    total_amount: float = Field(..., description="Valor total do pedido")
    status: str = Field(..., description="Status do pedido (CREATED, CONFIRMED, etc)")
    idempotency_key: Optional[str] = Field(None, description="Chave de idempotência")
    created_at: datetime = Field(..., description="Data de criação")
    updated_at: Optional[datetime] = Field(None, description="Data de atualização")
    items: List[OrderItemResponse] = Field(..., description="Lista de itens do pedido")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": 1,
                    "customer_id": 1,
                    "total_amount": 87.50,
                    "status": "CREATED",
                    "idempotency_key": "order-123-abc",
                    "created_at": "2025-12-07T10:30:00",
                    "updated_at": None,
                    "items": [
                        {
                            "id": 1,
                            "order_id": 1,
                            "product_id": 1,
                            "unit_price": 25.00,
                            "quantity": 2,
                            "line_total": 50.00
                        },
                        {
                            "id": 2,
                            "order_id": 1,
                            "product_id": 3,
                            "unit_price": 37.50,
                            "quantity": 1,
                            "line_total": 37.50
                        }
                    ]
                }
            ]
        }
    }


class OrderListResponse(BaseModel):
    """
    DTO para resposta de listagem paginada de pedidos.
    Segue o mesmo padrão de product_dto e customer_dto.
    """
    items: List[OrderResponse] = Field(..., description="Lista de pedidos")
    total: int = Field(..., description="Total de pedidos encontrados")
    page: int = Field(..., description="Página atual")
    page_size: int = Field(..., description="Tamanho da página")
    total_pages: int = Field(..., description="Total de páginas")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "items": [
                        {
                            "id": 1,
                            "customer_id": 1,
                            "total_amount": 87.50,
                            "status": "CREATED",
                            "created_at": "2025-12-07T10:30:00",
                            "items": []
                        }
                    ],
                    "total": 1,
                    "page": 1,
                    "page_size": 20,
                    "total_pages": 1
                }
            ]
        }
    }