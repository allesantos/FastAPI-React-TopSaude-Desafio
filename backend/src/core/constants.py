"""
Constantes usadas na aplicação.
"""
from enum import Enum


class OrderStatus(str, Enum):
    """Status possíveis de um pedido."""
    CREATED = "CREATED"
    PAID = "PAID"
    CANCELLED = "CANCELLED"


class ResponseCode(int, Enum):
    """Códigos de retorno do envelope de resposta."""
    SUCCESS = 0
    ERROR = 1


# Mensagens de erro padrão
ERROR_MESSAGES = {
    "PRODUCT_NOT_FOUND": "Produto não encontrado",
    "CUSTOMER_NOT_FOUND": "Cliente não encontrado",
    "ORDER_NOT_FOUND": "Pedido não encontrado",
    "INSUFFICIENT_STOCK": "Estoque insuficiente",
    "INVALID_SKU": "SKU inválido ou já existe",
    "INVALID_EMAIL": "Email inválido ou já existe",
    "INVALID_DOCUMENT": "Documento inválido ou já existe",
    "DUPLICATE_IDEMPOTENCY_KEY": "Pedido já foi criado com esta chave",
    "INVALID_ORDER_STATUS": "Status de pedido inválido",
}

# Configurações de paginação
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100