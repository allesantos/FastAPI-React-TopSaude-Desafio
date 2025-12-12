"""
Implementação concreta do repositório de pedidos.
Responsável por todas as operações de banco de dados relacionadas a pedidos.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from src.application.interfaces.repositories import IOrderRepository
from src.domain.entities.order import OrderEntity
from src.domain.entities.order_item import OrderItemEntity
from src.infrastructure.database.models import Order, OrderItem
from src.domain.exceptions.business_exceptions import OrderNotFoundException


class OrderRepository(IOrderRepository):
    """Implementação do repositório de pedidos usando SQLAlchemy."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, order: OrderEntity) -> OrderEntity:
        """
        Cria um pedido com seus itens em uma TRANSAÇÃO ATÔMICA.
        Se qualquer parte falhar, faz rollback completo.
        """
        try:
            db_order = Order(
                customer_id=order.customer_id,
                total_amount=order.total_amount,
                status=order.status,
                idempotency_key=order.idempotency_key
            )
            self.db.add(db_order)
            self.db.flush()
            
            for item in order.items:
                db_item = OrderItem(
                    order_id=db_order.id,
                    product_id=item.product_id,
                    unit_price=item.unit_price,
                    quantity=item.quantity,
                    line_total=item.line_total
                )
                self.db.add(db_item)
            
            self.db.commit()
            self.db.refresh(db_order)
            
            return self._to_entity(db_order)
        
        except Exception as e:
            self.db.rollback()
            raise e
    
    def get_by_id(self, order_id: int) -> Optional[OrderEntity]:
        """Busca um pedido por ID."""
        db_order = self.db.query(Order).filter(Order.id == order_id).first()
        if not db_order:
            return None
        return self._to_entity(db_order)
    
    def get_by_idempotency_key(self, idempotency_key: str) -> Optional[OrderEntity]:
        """Busca um pedido pela chave de idempotência."""
        db_order = self.db.query(Order).filter(Order.idempotency_key == idempotency_key).first()
        if not db_order:
            return None
        return self._to_entity(db_order)
    
    def list_all(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        customer_id: Optional[int] = None
    ) -> tuple[List[OrderEntity], int]:
        """
        Lista pedidos com paginação.
        Retorna tupla (lista_de_pedidos, total_de_registros).
        """
        query = self.db.query(Order)
        
        if customer_id:
            query = query.filter(Order.customer_id == customer_id)
        
        total = query.count()
        db_orders = query.offset(skip).limit(limit).all()
        
        return [self._to_entity(o) for o in db_orders], total
    
    def update(self, order: OrderEntity) -> OrderEntity:
        """Atualiza um pedido existente."""
        db_order = self.db.query(Order).filter(Order.id == order.id).first()
        
        if not db_order:
            raise OrderNotFoundException(f"Pedido {order.id} não encontrado")
        
        db_order.status = order.status
        db_order.updated_at = order.updated_at
        
        self.db.commit()
        self.db.refresh(db_order)
        
        return self._to_entity(db_order)
    
    def _to_entity(self, db_order: Order) -> OrderEntity:
        """Converte modelo ORM para entidade de domínio."""
        items = []
        
        for db_item in db_order.items:
            items.append(
                OrderItemEntity(
                    id=db_item.id,
                    order_id=db_item.order_id,
                    product_id=db_item.product_id,
                    unit_price=db_item.unit_price,
                    quantity=db_item.quantity,
                    line_total=db_item.line_total
                )
            )
        
        return OrderEntity(
            id=db_order.id,
            customer_id=db_order.customer_id,
            total_amount=db_order.total_amount,
            status=db_order.status,
            idempotency_key=db_order.idempotency_key,
            created_at=db_order.created_at,
            updated_at=db_order.updated_at,
            items=items
        )