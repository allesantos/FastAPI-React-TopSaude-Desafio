"""
Rotas REST para gerenciamento de pedidos.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Header, Query, status
from sqlalchemy.orm import Session

from src.api.response_envelope import success_response, error_response
from src.api.dependencies import get_order_use_cases
from src.application.use_cases.order_use_cases import OrderUseCases
from src.application.dtos.order_dto import OrderCreate, OrderResponse, OrderListResponse
from src.domain.exceptions.business_exceptions import (
    OrderNotFoundException,
    ProductNotFoundException,
    CustomerNotFoundException,
    InsufficientStockException,
    OrderCannotBeCancelledException,
    OrderCannotBePaidException
)
from src.infrastructure.logging.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/orders", tags=["Pedidos"])


@router.post(
    "",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Criar novo pedido"
)
def create_order(
    order_data: OrderCreate,
    idempotency_key: str = Header(..., alias="Idempotency-Key"),
    use_cases: OrderUseCases = Depends(get_order_use_cases)
):
    """Cria um novo pedido."""
    try:
        logger.info(
            "Requisição para criar pedido",
            extra={
                "customer_id": order_data.customer_id,
                "items_count": len(order_data.items),
                "idempotency_key": idempotency_key
            }
        )
        
        order = use_cases.create_order(order_data, idempotency_key)
        
        logger.info(
            "Pedido criado com sucesso",
            extra={
                "order_id": order.id,
                "total_amount": order.total_amount
            }
        )
        
        return success_response(
            data=order.model_dump(),
            message="Pedido criado com sucesso"
        )
    
    except CustomerNotFoundException as e:
        logger.warning("Cliente não encontrado", extra={"error": str(e)})
        return error_response(message=str(e))
    
    except ProductNotFoundException as e:
        logger.warning("Produto não encontrado", extra={"error": str(e)})
        return error_response(message=str(e))
    
    except InsufficientStockException as e:
        logger.warning("Estoque insuficiente", extra={"error": str(e)})
        return error_response(message=str(e))
    
    except ValueError as e:
        logger.warning("Erro de validação", extra={"error": str(e)})
        return error_response(message=str(e))
    
    except Exception as e:
        logger.error(
            "Erro inesperado ao criar pedido",
            extra={"error": str(e)},
            exc_info=True
        )
        return error_response(message="Erro interno no servidor")


@router.get(
    "",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Listar pedidos"
)
def list_orders(
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(20, ge=1, le=100, description="Itens por página"),
    customer_id: Optional[int] = Query(None, description="Filtrar por cliente"),
    use_cases: OrderUseCases = Depends(get_order_use_cases)
):
    """Lista pedidos com paginação."""
    try:
        logger.info(
            "Requisição para listar pedidos",
            extra={
                "page": page,
                "page_size": page_size,
                "customer_id": customer_id
            }
        )
        
        result = use_cases.list_orders(
            page=page,
            page_size=page_size,
            customer_id=customer_id
        )
        
        logger.info(
            "Pedidos listados com sucesso",
            extra={
                "total": result.total,
                "page": result.page,
                "returned_items": len(result.items)
            }
        )
        
        return success_response(
            data=result.model_dump(),
            message="Pedidos listados com sucesso"
        )
    
    except Exception as e:
        logger.error(
            "Erro ao listar pedidos",
            extra={"error": str(e)},
            exc_info=True
        )
        return error_response(message="Erro ao listar pedidos")


@router.get(
    "/{order_id}",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Buscar pedido por ID"
)
def get_order(
    order_id: int,
    use_cases: OrderUseCases = Depends(get_order_use_cases)
):
    """Busca um pedido por ID."""
    try:
        logger.info("Requisição para buscar pedido", extra={"order_id": order_id})
        
        order = use_cases.get_order_by_id(order_id)
        
        logger.info(
            "Pedido encontrado",
            extra={
                "order_id": order.id,
                "customer_id": order.customer_id
            }
        )
        
        return success_response(
            data=order.model_dump(),
            message="Pedido encontrado"
        )
    
    except OrderNotFoundException as e:
        logger.warning("Pedido não encontrado", extra={"error": str(e)})
        return error_response(message=str(e))
    
    except Exception as e:
        logger.error(
            "Erro ao buscar pedido",
            extra={"error": str(e)},
            exc_info=True
        )
        return error_response(message="Erro ao buscar pedido")


@router.patch(
    "/{order_id}/cancel",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Cancelar pedido"
)
def cancel_order(
    order_id: int,
    use_cases: OrderUseCases = Depends(get_order_use_cases)
):
    """Cancela um pedido."""
    try:
        logger.info("Requisição para cancelar pedido", extra={"order_id": order_id})
        
        order = use_cases.cancel_order(order_id)
        
        logger.info("Pedido cancelado com sucesso", extra={"order_id": order_id})
        
        return success_response(
            data=order.model_dump(),
            message="Pedido cancelado com sucesso"
        )
    
    except OrderNotFoundException as e:
        logger.warning("Pedido não encontrado", extra={"error": str(e)})
        return error_response(message=str(e))
    
    except OrderCannotBeCancelledException as e:
        logger.warning("Pedido não pode ser cancelado", extra={"error": str(e)})
        return error_response(message=str(e))
    
    except Exception as e:
        logger.error(
            "Erro ao cancelar pedido",
            extra={"error": str(e)},
            exc_info=True
        )
        return error_response(message="Erro ao cancelar pedido")


@router.patch(
    "/{order_id}/pay",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Marcar pedido como pago"
)
def mark_order_as_paid(
    order_id: int,
    use_cases: OrderUseCases = Depends(get_order_use_cases)
):
    """Marca um pedido como pago."""
    try:
        logger.info("Requisição para marcar pedido como pago", extra={"order_id": order_id})
        
        order = use_cases.mark_as_paid(order_id)
        
        logger.info("Pedido marcado como pago", extra={"order_id": order_id})
        
        return success_response(
            data=order.model_dump(),
            message="Pedido marcado como pago com sucesso"
        )
    
    except OrderNotFoundException as e:
        logger.warning("Pedido não encontrado", extra={"error": str(e)})
        return error_response(message=str(e))
    
    except OrderCannotBePaidException as e:
        logger.warning("Pedido não pode ser marcado como pago", extra={"error": str(e)})
        return error_response(message=str(e))
    
    except Exception as e:
        logger.error(
            "Erro ao marcar pedido como pago",
            extra={"error": str(e)},
            exc_info=True
        )
        return error_response(message="Erro ao marcar pedido como pago")