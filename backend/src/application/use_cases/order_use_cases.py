from typing import List, Optional, Tuple
from decimal import Decimal
from sqlalchemy.orm import Session

from src.application.dtos.order_dto import (
    OrderCreate,
    OrderResponse,
    OrderItemResponse,
    OrderListResponse
)
from src.application.interfaces.repositories import (
    IOrderRepository,
    IProductRepository,
    ICustomerRepository
)
from src.domain.entities.order import OrderEntity
from src.domain.entities.order_item import OrderItemEntity
from src.domain.exceptions.business_exceptions import (
    OrderNotFoundException,
    ProductNotFoundException,
    CustomerNotFoundException,
    InsufficientStockException,
    DuplicateIdempotencyKeyException
)
from src.infrastructure.logging.logger import get_logger
from src.core.constants import OrderStatus

logger = get_logger(__name__)


class OrderUseCases:
    """Use Cases para gerenciamento de pedidos."""
    
    def __init__(
        self,
        order_repository: IOrderRepository,
        product_repository: IProductRepository,
        customer_repository: ICustomerRepository,
        db: Session
    ):
        self.order_repository = order_repository
        self.product_repository = product_repository
        self.customer_repository = customer_repository
        self.db = db
    
    def create_order(
        self, 
        order_data: OrderCreate, 
        idempotency_key: str
    ) -> OrderResponse:
        """
        Cria um novo pedido com validações completas e idempotência.
        
        FUNCIONALIDADES CRÍTICAS:
        - Idempotência: Se mesma key já existe, retorna pedido existente
        - Validação de cliente (existe e ativo)
        - Validação de produtos (existem e ativos)
        - Validação de estoque (disponível para todos itens)
        - Cálculo de totais (line_total e total_amount)
        - Atualização de estoque (desconta quantidades)
        - Transação atômica (tudo ou nada)
        
        Args:
            order_data: Dados do pedido (customer_id + items)
            idempotency_key: Chave única para evitar duplicação
        
        Returns:
            OrderResponse com pedido criado
        
        Raises:
            CustomerNotFoundException: Cliente não encontrado
            ProductNotFoundException: Produto não encontrado
            InsufficientStockException: Estoque insuficiente
            ValueError: Produto inativo
        """
        logger.info(
            "Iniciando criação de pedido",
            extra={
                "customer_id": order_data.customer_id,
                "idempotency_key": idempotency_key,
                "items_count": len(order_data.items)
            }
        )
        
        # ========================================
        # 1. IDEMPOTÊNCIA - Verificar se já existe
        # ========================================
        existing_order = self.order_repository.get_by_idempotency_key(idempotency_key)
        if existing_order:
            logger.warning(
                "Pedido com mesma idempotency_key já existe",
                extra={
                    "idempotency_key": idempotency_key,
                    "existing_order_id": existing_order.id
                }
            )
            # Retornar pedido existente (não criar duplicado)
            return self._entity_to_response(existing_order)
        
        try:
            # ========================================
            # 2. VALIDAR CLIENTE
            # ========================================
            customer = self.customer_repository.get_by_id(order_data.customer_id)
            if not customer:
                logger.error(
                    "Cliente não encontrado",
                    extra={"customer_id": order_data.customer_id}
                )
                raise CustomerNotFoundException(
                    f"Cliente com ID {order_data.customer_id} não encontrado"
                )
            
            if not customer.is_active:
                logger.error(
                    "Cliente inativo",
                    extra={"customer_id": order_data.customer_id}
                )
                raise ValueError(
                    f"Cliente com ID {order_data.customer_id} está inativo"
                )
            
            # ========================================
            # 3. VALIDAR PRODUTOS E ESTOQUE
            # ========================================
            items_entities = []
            total_amount = Decimal("0.00")
            
            for item_data in order_data.items:
                # Buscar produto
                product = self.product_repository.get_by_id(item_data.product_id)
                
                if not product:
                    logger.error(
                        "Produto não encontrado",
                        extra={"product_id": item_data.product_id}
                    )
                    raise ProductNotFoundException(
                        f"Produto com ID {item_data.product_id} não encontrado"
                    )
                
                # Validar se produto está ativo
                if not product.is_active:
                    logger.error(
                        "Produto inativo",
                        extra={"product_id": item_data.product_id}
                    )
                    raise ValueError(
                        f"Produto '{product.name}' (ID {item_data.product_id}) está inativo"
                    )
                
                # Validar estoque disponível
                if product.stock_qty < item_data.quantity:
                    logger.error(
                        "Estoque insuficiente",
                        extra={
                            "product_id": item_data.product_id,
                            "product_name": product.name,
                            "available": product.stock_qty,
                            "requested": item_data.quantity
                        }
                    )
                    raise InsufficientStockException(
                        f"Estoque insuficiente para produto '{product.name}'. "
                        f"Disponível: {product.stock_qty}, Solicitado: {item_data.quantity}"
                    )
                
                # Calcular totais
                unit_price = Decimal(str(product.price))
                quantity = item_data.quantity
                line_total = unit_price * Decimal(quantity)
                total_amount += line_total
                
                # Criar entidade do item
                item_entity = OrderItemEntity(
                    id=None,
                    order_id=None,  # Será preenchido após criar pedido
                    product_id=item_data.product_id,
                    unit_price=unit_price,
                    quantity=quantity,
                    line_total=line_total
                )
                item_entity.validate()  # Validar regras de negócio
                items_entities.append(item_entity)
            
            # ========================================
            # 4. CRIAR ENTIDADE DO PEDIDO
            # ========================================
            order_entity = OrderEntity(
                id=None,
                customer_id=order_data.customer_id,
                total_amount=total_amount,
                status=OrderStatus.CREATED.value,
                idempotency_key=idempotency_key,
                items=items_entities
            )
            order_entity.validate()  # Validar regras de negócio
            
            # ========================================
            # 5. PERSISTIR PEDIDO (Transação Atômica)
            # ========================================
            # IMPORTANTE: order_repository.create() já faz transação atômica
            # devido às correções da Parte 9B
            created_order = self.order_repository.create(order_entity)
            
            # ========================================
            # 6. ATUALIZAR ESTOQUE DOS PRODUTOS
            # ========================================
            # NOTA: Isso deve estar na MESMA transação do create()
            # Para garantir atomicidade, vamos fazer flush() mas sem commit()
            for item_data in order_data.items:
                product = self.product_repository.get_by_id(item_data.product_id)
                product.stock_qty -= item_data.quantity
                self.product_repository.update(product)
            
            # Commit final (se o repository não fez ainda)
            self.db.commit()
            
            logger.info(
                "Pedido criado com sucesso",
                extra={
                    "order_id": created_order.id,
                    "customer_id": created_order.customer_id,
                    "total_amount": float(created_order.total_amount),
                    "items_count": len(created_order.items)
                }
            )
            
            return self._entity_to_response(created_order)
        
        except (
            CustomerNotFoundException,
            ProductNotFoundException,
            InsufficientStockException,
            ValueError
        ):
            # Rollback mantendo a exceção original
            self.db.rollback()
            raise

        except Exception as e:
            # Rollback para erro inesperado
            self.db.rollback()
            logger.error(
                "Erro inesperado ao criar pedido",
                extra={
                    "error": str(e),
                    "customer_id": order_data.customer_id,
                    "idempotency_key": idempotency_key
                },
                exc_info=True
            )
            raise
    
    def get_order_by_id(self, order_id: int) -> OrderResponse:
        """
        Busca um pedido por ID.
        
        Args:
            order_id: ID do pedido
        
        Returns:
            OrderResponse com dados completos do pedido
        
        Raises:
            OrderNotFoundException: Pedido não encontrado
        """
        logger.info("Buscando pedido por ID", extra={"order_id": order_id})
        
        order = self.order_repository.get_by_id(order_id)
        
        if not order:
            logger.warning("Pedido não encontrado", extra={"order_id": order_id})
            raise OrderNotFoundException(f"Pedido com ID {order_id} não encontrado")
        
        return self._entity_to_response(order)
    
    def list_orders(
        self,
        page: int = 1,
        page_size: int = 20,
        customer_id: Optional[int] = None
    ) -> OrderListResponse:
        """
        Lista pedidos com paginação e filtros.
        
        Args:
            page: Número da página (começa em 1)
            page_size: Quantidade de itens por página
            customer_id: Filtrar por cliente (opcional)
        
        Returns:
            OrderListResponse com lista paginada de pedidos
        """
        logger.info(
            "Listando pedidos",
            extra={
                "page": page,
                "page_size": page_size,
                "customer_id": customer_id
            }
        )
        
        # Calcular skip
        skip = (page - 1) * page_size
        
        # Buscar pedidos (retorna tupla: lista + total)
        orders, total = self.order_repository.list_all(
            skip=skip,
            limit=page_size,
            customer_id=customer_id
        )
        
        # Converter para DTOs
        items = [self._entity_to_response(order) for order in orders]
        
        # Calcular total de páginas
        total_pages = (total + page_size - 1) // page_size
        
        return OrderListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    
    def _entity_to_response(self, order: OrderEntity) -> OrderResponse:
        """
        Converte OrderEntity para OrderResponse (DTO).
        
        Args:
            order: Entidade do pedido
        
        Returns:
            OrderResponse (DTO)
        """
        # Converter itens
        items_response = [
            OrderItemResponse(
                id=item.id,
                order_id=item.order_id,
                product_id=item.product_id,
                unit_price=float(item.unit_price),
                quantity=item.quantity,
                line_total=float(item.line_total)
            )
            for item in order.items
        ]
        
        # Converter pedido
        return OrderResponse(
            id=order.id,
            customer_id=order.customer_id,
            total_amount=float(order.total_amount),
            status=order.status,
            idempotency_key=order.idempotency_key,
            created_at=order.created_at,
            updated_at=order.updated_at,
            items=items_response
        )