"""
Exceções de negócio da aplicação.
"""


class BusinessException(Exception):
    """Exceção base para erros de negócio."""
    
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class ProductNotFoundException(BusinessException):
    """Produto não encontrado."""
    pass


class CustomerNotFoundException(BusinessException):
    """Cliente não encontrado."""
    pass


class OrderNotFoundException(BusinessException):
    """Pedido não encontrado."""
    pass


class InsufficientStockException(BusinessException):
    """Estoque insuficiente."""
    pass


class DuplicateSKUException(BusinessException):
    """SKU duplicado."""
    pass


class DuplicateEmailException(BusinessException):
    """Email duplicado."""
    pass


class DuplicateDocumentException(BusinessException):
    """Documento duplicado."""
    pass


class DuplicateIdempotencyKeyException(BusinessException):
    """Chave de idempotência duplicada."""
    pass


class InvalidOrderStatusException(BusinessException):
    """Status de pedido inválido."""
    pass


class OrderCannotBeCancelledException(BusinessException):
    """Pedido não pode ser cancelado."""
    pass


class OrderCannotBePaidException(BusinessException):
    """Pedido não pode ser marcado como pago."""
    pass