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
    InsufficientStockException
)
from src.infrastructure.logging.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/orders", tags=["Pedidos"])


@router.post(
    "",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Criar novo pedido",
    description="""
    Cria um novo pedido com validações completas.
    
    **IMPORTANTE:** Header `Idempotency-Key` é obrigatório para evitar duplicação.
    
    **Validações:**
    - Cliente deve existir e estar ativo
    - Produtos devem existir e estar ativos
    - Estoque deve ser suficiente para todos itens
    - Cálculo automático de totais
    - Atualização automática de estoque
    - Transação atômica (tudo ou nada)
    
    **Idempotência:**
    Se mesma `Idempotency-Key` for enviada novamente, retorna o pedido existente
    ao invés de criar um duplicado.
    """
)
def create_order(
    order_data: OrderCreate,
    idempotency_key: str = Header(..., alias="Idempotency-Key"),
    use_cases: OrderUseCases = Depends(get_order_use_cases)
):
    """
    Cria um novo pedido.
    
    Args:
        order_data: Dados do pedido (customer_id + items)
        idempotency_key: Chave única para idempotência (header obrigatório)
        use_cases: Use cases de pedidos (injetado)
    
    Returns:
        Envelope com OrderResponse
    
    Raises:
        400: Dados inválidos, cliente/produto não encontrado, estoque insuficiente
        500: Erro interno do servidor
    """
    try:
        logger.info(
            "Requisição para criar pedido",
            extra={
                "customer_id": order_data.customer_id,
                "items_count": len(order_data.items),
                "idempotency_key": idempotency_key
            }
        )
        
        # Criar pedido (com todas validações)
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
        return error_response(
            message=str(e)
        )
    
    except ProductNotFoundException as e:
        logger.warning("Produto não encontrado", extra={"error": str(e)})
        return error_response(
            message=str(e)
        )
    
    except InsufficientStockException as e:
        logger.warning("Estoque insuficiente", extra={"error": str(e)})
        return error_response(
            message=str(e)
        )
    
    except ValueError as e:
        logger.warning("Erro de validação", extra={"error": str(e)})
        return error_response(
            message=str(e)
        )
    
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
    summary="Listar pedidos",
    description="""
    Lista pedidos com paginação e filtros opcionais.
    
    **Paginação:**
    - `page`: Número da página (padrão: 1)
    - `page_size`: Itens por página (padrão: 20, máx: 100)
    
    **Filtros:**
    - `customer_id`: Filtrar pedidos de um cliente específico
    """
)
def list_orders(
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(20, ge=1, le=100, description="Itens por página"),
    customer_id: Optional[int] = Query(None, description="Filtrar por cliente"),
    use_cases: OrderUseCases = Depends(get_order_use_cases)
):
    """
    Lista pedidos com paginação.
    
    Args:
        page: Número da página (mín: 1)
        page_size: Itens por página (mín: 1, máx: 100)
        customer_id: ID do cliente para filtrar (opcional)
        use_cases: Use cases de pedidos (injetado)
    
    Returns:
        Envelope com OrderListResponse (lista + metadados)
    """
    try:
        logger.info(
            "Requisição para listar pedidos",
            extra={
                "page": page,
                "page_size": page_size,
                "customer_id": customer_id
            }
        )
        
        # Listar pedidos
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
        return error_response(
            message="Erro ao listar pedidos"
        )


@router.get(
    "/{order_id}",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Buscar pedido por ID",
    description="""
    Busca um pedido específico por ID.
    
    Retorna todos os dados do pedido incluindo:
    - Informações do pedido (customer_id, total, status)
    - Lista completa de itens (produtos, quantidades, preços)
    - Datas de criação e atualização
    """
)
def get_order(
    order_id: int,
    use_cases: OrderUseCases = Depends(get_order_use_cases)
):
    """
    Busca um pedido por ID.
    
    Args:
        order_id: ID do pedido
        use_cases: Use cases de pedidos (injetado)
    
    Returns:
        Envelope com OrderResponse
    
    Raises:
        404: Pedido não encontrado
        500: Erro interno do servidor
    """
    try:
        logger.info("Requisição para buscar pedido", extra={"order_id": order_id})
        
        # Buscar pedido
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
        return error_response(
            message=str(e)
        )
    
    except Exception as e:
        logger.error(
            "Erro ao buscar pedido",
            extra={"error": str(e)},
            exc_info=True
        )
        return error_response(
            message="Erro ao buscar pedido"
        )
