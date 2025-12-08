"""
Implementação concreta do repositório de pedidos.
Responsável por todas as operações de banco de dados relacionadas a pedidos.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from src.application.interfaces.repositories import IOrderRepository
from src.domain.entities.order import OrderEntity
from src.domain.entities.order_item import OrderItemEntity  # ✅ ADICIONADO!
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
            # Criar pedido
            db_order = Order(
                customer_id=order.customer_id,
                total_amount=order.total_amount,
                status=order.status,
                idempotency_key=order.idempotency_key
            )
            self.db.add(db_order)
            self.db.flush()  # ✅ Flush para obter ID, mas SEM commit ainda
            
            # Criar os itens do pedido
            for item in order.items:
                db_item = OrderItem(
                    order_id=db_order.id,  # ✅ Agora temos o ID do pedido
                    product_id=item.product_id,
                    unit_price=item.unit_price,
                    quantity=item.quantity,
                    line_total=item.line_total
                )
                self.db.add(db_item)
            
            # ✅ ÚNICO commit ao final (transação atômica)
            self.db.commit()
            self.db.refresh(db_order)
            
            return self._to_entity(db_order)
        
        except Exception as e:
            # ✅ Rollback se qualquer coisa falhar
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
    ) -> tuple[List[OrderEntity], int]:  # ✅ CORRIGIDO: Agora retorna tupla
        """
        Lista pedidos com paginação.
        Retorna tupla (lista_de_pedidos, total_de_registros).
        """
        query = self.db.query(Order)
        
        if customer_id:
            query = query.filter(Order.customer_id == customer_id)
        
        # ✅ Contar total ANTES de aplicar skip/limit
        total = query.count()
        
        # Buscar registros paginados
        db_orders = query.offset(skip).limit(limit).all()
        
        # ✅ Retornar tupla (lista, total)
        return [self._to_entity(o) for o in db_orders], total
    
    def update(self, order: OrderEntity) -> OrderEntity:
        """Atualiza um pedido existente."""
        db_order = self.db.query(Order).filter(Order.id == order.id).first()
        if not db_order:
            raise OrderNotFoundException(f"Pedido com ID {order.id} não encontrado")
        
        db_order.customer_id = order.customer_id
        db_order.total_amount = order.total_amount
        db_order.status = order.status
        self.db.commit()
        self.db.refresh(db_order)
        return self._to_entity(db_order)
    
    def _to_entity(self, db_order: Order) -> OrderEntity:
        """
        Converte modelo ORM para entidade de domínio.
        ✅ CORRIGIDO: Agora cria OrderItemEntity corretamente!
        """
        items = []
        
        # ✅ Criar OrderItemEntity para cada item (NÃO OrderEntity!)
        for db_item in db_order.items:
            items.append(
                OrderItemEntity(  # ✅ CORRETO! Era OrderEntity antes (ERRO!)
                    id=db_item.id,
                    order_id=db_item.order_id,
                    product_id=db_item.product_id,
                    unit_price=db_item.unit_price,
                    quantity=db_item.quantity,
                    line_total=db_item.line_total
                )
            )
        
        # Criar e retornar OrderEntity com os itens
        return OrderEntity(
            id=db_order.id,
            customer_id=db_order.customer_id,
            total_amount=db_order.total_amount,
            status=db_order.status,
            idempotency_key=db_order.idempotency_key,
            created_at=db_order.created_at,
            updated_at=db_order.updated_at,
            items=items  # ✅ Lista de OrderItemEntity
        )