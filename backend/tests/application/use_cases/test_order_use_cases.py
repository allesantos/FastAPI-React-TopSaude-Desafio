"""
Testes unitários para OrderUseCases.
Valida as regras de negócio MAIS CRÍTICAS do sistema.
"""

import pytest
from decimal import Decimal
from unittest.mock import MagicMock, call
from datetime import datetime

from src.application.use_cases.order_use_cases import OrderUseCases
from src.application.dtos.order_dto import OrderCreate, OrderItemCreate
from src.domain.exceptions.business_exceptions import (
    CustomerNotFoundException,
    ProductNotFoundException,
    InsufficientStockException
)
from src.core.constants import OrderStatus


class TestOrderUseCases:
    """Testes dos Use Cases de Order."""
    
    # ==========================================
    # FIXTURES LOCAIS
    # ==========================================
    
    @pytest.fixture
    def use_case(
        self,
        mock_order_repository,
        mock_product_repository,
        mock_customer_repository,
        mock_db_session
    ):
        """Cria instância do OrderUseCases com mocks."""
        return OrderUseCases(
            order_repository=mock_order_repository,
            product_repository=mock_product_repository,
            customer_repository=mock_customer_repository,
            db=mock_db_session
        )
    
    @pytest.fixture
    def valid_order_data(self):
        """Dados válidos para criar pedido."""
        return OrderCreate(
            customer_id=1,
            items=[
                OrderItemCreate(product_id=1, quantity=2),
                OrderItemCreate(product_id=2, quantity=3)
            ]
        )
    
    # ==========================================
    # TESTES BÁSICOS
    # ==========================================
    
    def test_create_order_sucesso(
        self,
        use_case,
        valid_order_data,
        customer_factory,
        product_factory,
        order_factory,
        mock_customer_repository,
        mock_product_repository,
        mock_order_repository,
        mock_db_session
    ):
        """Deve criar pedido válido com sucesso."""
        # Arrange
        idempotency_key = "test-key-123"
        
        # Mock: Não existe pedido com essa key
        mock_order_repository.get_by_idempotency_key.return_value = None
        
        # Mock: Cliente existe e está ativo
        customer = customer_factory(id=1, is_active=True)
        mock_customer_repository.get_by_id.return_value = customer
        
        # Mock: Produtos existem e têm estoque
        product1 = product_factory(id=1, price=Decimal("10.00"), stock_qty=100, is_active=True)
        product2 = product_factory(id=2, price=Decimal("15.00"), stock_qty=50, is_active=True)
        mock_product_repository.get_by_id.side_effect = [product1, product2, product1, product2]
        
        # Mock: Pedido criado
        created_order = order_factory(
            id=1,
            customer_id=1,
            total_amount=Decimal("65.00"),
            idempotency_key=idempotency_key
        )
        mock_order_repository.create.return_value = created_order
        
        # Act
        result = use_case.create_order(valid_order_data, idempotency_key)
        
        # Assert
        assert result.id == 1
        assert result.customer_id == 1
        assert result.total_amount == 65.00
        assert result.idempotency_key == idempotency_key
        
        # Verificar se commit foi chamado
        mock_db_session.commit.assert_called_once()
        
        # Verificar se create foi chamado
        mock_order_repository.create.assert_called_once()
        
        # Verificar se estoque foi atualizado (2 produtos)
        assert mock_product_repository.update.call_count == 2
    
    def test_create_order_cliente_nao_encontrado(
        self,
        use_case,
        valid_order_data,
        mock_customer_repository,
        mock_order_repository,
        mock_db_session
    ):
        """Deve lançar exceção se cliente não existir."""
        # Arrange
        idempotency_key = "test-key-456"
        
        # Mock: Não existe pedido com essa key
        mock_order_repository.get_by_idempotency_key.return_value = None
        
        # Mock: Cliente NÃO existe
        mock_customer_repository.get_by_id.return_value = None
        
        # Act & Assert
        with pytest.raises(CustomerNotFoundException, match="Cliente com ID 1 não encontrado"):
            use_case.create_order(valid_order_data, idempotency_key)
        
        # Verificar rollback
        mock_db_session.rollback.assert_called_once()
    
    def test_create_order_produto_nao_encontrado(
        self,
        use_case,
        valid_order_data,
        customer_factory,
        mock_customer_repository,
        mock_product_repository,
        mock_order_repository,
        mock_db_session
    ):
        """Deve lançar exceção se produto não existir."""
        # Arrange
        idempotency_key = "test-key-789"
        
        # Mock: Não existe pedido com essa key
        mock_order_repository.get_by_idempotency_key.return_value = None
        
        # Mock: Cliente existe
        customer = customer_factory(id=1, is_active=True)
        mock_customer_repository.get_by_id.return_value = customer
        
        # Mock: Produto NÃO existe
        mock_product_repository.get_by_id.return_value = None
        
        # Act & Assert
        with pytest.raises(ProductNotFoundException, match="Produto com ID 1 não encontrado"):
            use_case.create_order(valid_order_data, idempotency_key)
        
        # Verificar rollback
        mock_db_session.rollback.assert_called_once()
    
    # ==========================================
    # TESTES DE VALIDAÇÕES
    # ==========================================
    
    def test_create_order_produto_inativo(
        self,
        use_case,
        valid_order_data,
        customer_factory,
        product_factory,
        mock_customer_repository,
        mock_product_repository,
        mock_order_repository,
        mock_db_session
    ):
        """Deve rejeitar pedido com produto inativo."""
        # Arrange
        idempotency_key = "test-inactive"
        
        # Mock: Não existe pedido com essa key
        mock_order_repository.get_by_idempotency_key.return_value = None
        
        # Mock: Cliente existe
        customer = customer_factory(id=1, is_active=True)
        mock_customer_repository.get_by_id.return_value = customer
        
        # Mock: Produto existe mas está INATIVO
        product1 = product_factory(id=1, is_active=False)
        mock_product_repository.get_by_id.return_value = product1
        
        # Act & Assert
        with pytest.raises(ValueError, match="está inativo"):
            use_case.create_order(valid_order_data, idempotency_key)
        
        # Verificar rollback
        mock_db_session.rollback.assert_called_once()
    
    def test_create_order_estoque_insuficiente(
        self,
        use_case,
        valid_order_data,
        customer_factory,
        product_factory,
        mock_customer_repository,
        mock_product_repository,
        mock_order_repository,
        mock_db_session
    ):
        """Deve rejeitar pedido se estoque insuficiente."""
        # Arrange
        idempotency_key = "test-stock"
        
        # Mock: Não existe pedido com essa key
        mock_order_repository.get_by_idempotency_key.return_value = None
        
        # Mock: Cliente existe
        customer = customer_factory(id=1, is_active=True)
        mock_customer_repository.get_by_id.return_value = customer
        
        # Mock: Produto existe mas com ESTOQUE INSUFICIENTE
        product1 = product_factory(
            id=1,
            name="Produto Teste",
            stock_qty=1,  # Só tem 1 unidade
            is_active=True
        )
        mock_product_repository.get_by_id.return_value = product1
        
        # Pedido quer 2 unidades (valid_order_data.items[0].quantity = 2)
        
        # Act & Assert
        with pytest.raises(InsufficientStockException, match="Estoque insuficiente"):
            use_case.create_order(valid_order_data, idempotency_key)
        
        # Verificar rollback
        mock_db_session.rollback.assert_called_once()
    
    # ==========================================
    # 🔥 TESTES CRÍTICOS - IDEMPOTÊNCIA
    # ==========================================
    
    def test_create_order_idempotencia_mesma_key(
        self,
        use_case,
        valid_order_data,
        order_factory,
        mock_order_repository
    ):
        """
        CRÍTICO: Deve retornar mesmo pedido se idempotency_key já existe.
        NÃO deve criar duplicado!
        """
        # Arrange
        idempotency_key = "idem-123"
        
        # Mock: JÁ EXISTE pedido com essa key
        existing_order = order_factory(
            id=999,
            customer_id=1,
            idempotency_key=idempotency_key
        )
        mock_order_repository.get_by_idempotency_key.return_value = existing_order
        
        # Act
        result = use_case.create_order(valid_order_data, idempotency_key)
        
        # Assert
        # Deve retornar o pedido EXISTENTE (ID 999)
        assert result.id == 999
        assert result.idempotency_key == idempotency_key
        
        # NÃO deve ter chamado create() novamente
        mock_order_repository.create.assert_not_called()
    
    def test_create_order_idempotencia_payload_diferente(
        self,
        use_case,
        order_factory,
        mock_order_repository
    ):
        """
        CRÍTICO: Mesmo com payload diferente, se key é igual, retorna pedido original.
        """
        # Arrange
        idempotency_key = "idem-456"
        
        # Pedido A (original)
        order_data_a = OrderCreate(
            customer_id=1,
            items=[OrderItemCreate(product_id=1, quantity=2)]
        )
        
        # Pedido B (DIFERENTE! customer_id=2)
        order_data_b = OrderCreate(
            customer_id=2,
            items=[OrderItemCreate(product_id=3, quantity=5)]
        )
        
        # Mock: Pedido A já existe com essa key
        existing_order_a = order_factory(
            id=111,
            customer_id=1,  # Customer do pedido A
            idempotency_key=idempotency_key
        )
        mock_order_repository.get_by_idempotency_key.return_value = existing_order_a
        
        # Act: Tentar criar pedido B com mesma key
        result = use_case.create_order(order_data_b, idempotency_key)
        
        # Assert: Deve retornar pedido A (original)
        assert result.id == 111
        assert result.customer_id == 1  # Customer do pedido A, NÃO do B!
        
        # NÃO deve ter criado pedido B
        mock_order_repository.create.assert_not_called()
    
    # ==========================================
    # 🔥 TESTES CRÍTICOS - TRANSAÇÃO ATÔMICA
    # ==========================================
    
    def test_create_order_transacao_rollback(
        self,
        use_case,
        customer_factory,
        product_factory,
        mock_customer_repository,
        mock_product_repository,
        mock_order_repository,
        mock_db_session
    ):
        """
        CRÍTICO: Se erro ocorrer, deve fazer rollback.
        Estoque NÃO deve ser alterado!
        """
        # Arrange
        idempotency_key = "rollback-test"
        
        order_data = OrderCreate(
            customer_id=1,
            items=[
                OrderItemCreate(product_id=1, quantity=5),
                OrderItemCreate(product_id=2, quantity=10)  # Vai falhar aqui!
            ]
        )
        
        # Mock: Não existe pedido com essa key
        mock_order_repository.get_by_idempotency_key.return_value = None
        
        # Mock: Cliente existe
        customer = customer_factory(id=1, is_active=True)
        mock_customer_repository.get_by_id.return_value = customer
        
        # Mock: Produto 1 OK (10 unidades)
        product1 = product_factory(id=1, stock_qty=10, is_active=True)
        
        # Mock: Produto 2 INSUFICIENTE (só 3 unidades, pedido quer 10)
        product2 = product_factory(id=2, stock_qty=3, is_active=True, name="Produto 2")
        
        mock_product_repository.get_by_id.side_effect = [product1, product2]
        
        # Act & Assert
        with pytest.raises(InsufficientStockException):
            use_case.create_order(order_data, idempotency_key)
        
        # Assert CRÍTICO: Rollback foi chamado
        mock_db_session.rollback.assert_called_once()
        
        # Assert CRÍTICO: Estoque do produto 1 NÃO deve ter sido alterado
        # (Verificamos que update não foi chamado pois erro ocorreu antes)
        mock_product_repository.update.assert_not_called()
    
    # ==========================================
    # TESTES DE NEGÓCIO
    # ==========================================
    
    def test_create_order_atualiza_estoque(
        self,
        use_case,
        valid_order_data,
        customer_factory,
        product_factory,
        order_factory,
        mock_customer_repository,
        mock_product_repository,
        mock_order_repository,
        mock_db_session
    ):
        """Deve descontar estoque dos produtos após criar pedido."""
        # Arrange
        idempotency_key = "stock-test"
        
        # Mock: Não existe pedido com essa key
        mock_order_repository.get_by_idempotency_key.return_value = None
        
        # Mock: Cliente existe
        customer = customer_factory(id=1, is_active=True)
        mock_customer_repository.get_by_id.return_value = customer
        
        # Mock: Produtos com estoque
        product1 = product_factory(id=1, stock_qty=100, is_active=True)
        product2 = product_factory(id=2, stock_qty=50, is_active=True)
        mock_product_repository.get_by_id.side_effect = [
            product1, product2,  # Primeira passada (validação)
            product1, product2   # Segunda passada (atualização)
        ]
        
        # Mock: Pedido criado
        created_order = order_factory(id=1, idempotency_key=idempotency_key)
        mock_order_repository.create.return_value = created_order
        
        # Act
        use_case.create_order(valid_order_data, idempotency_key)
        
        # Assert: Estoque foi descontado
        # Produto 1: 100 - 2 = 98
        # Produto 2: 50 - 3 = 47
        assert product1.stock_qty == 98
        assert product2.stock_qty == 47
        
        # Assert: Update foi chamado 2x (1 para cada produto)
        assert mock_product_repository.update.call_count == 2
    
    def test_create_order_calcula_totais_corretamente(
        self,
        use_case,
        customer_factory,
        product_factory,
        order_factory,
        mock_customer_repository,
        mock_product_repository,
        mock_order_repository,
        mock_db_session
    ):
        """Deve calcular line_total e total_amount corretamente."""
        # Arrange
        idempotency_key = "calc-test"
        
        order_data = OrderCreate(
            customer_id=1,
            items=[
                OrderItemCreate(product_id=1, quantity=2),  # 10.00 * 2 = 20.00
                OrderItemCreate(product_id=2, quantity=3)   # 15.00 * 3 = 45.00
            ]
        )
        
        # Mock: Não existe pedido
        mock_order_repository.get_by_idempotency_key.return_value = None
        
        # Mock: Cliente existe
        customer = customer_factory(id=1, is_active=True)
        mock_customer_repository.get_by_id.return_value = customer
        
        # Mock: Produtos com preços
        product1 = product_factory(id=1, price=Decimal("10.00"), stock_qty=100, is_active=True)
        product2 = product_factory(id=2, price=Decimal("15.00"), stock_qty=50, is_active=True)
        mock_product_repository.get_by_id.side_effect = [product1, product2, product1, product2]
        
        # Mock: Capturar pedido criado
        created_order = None
        def capture_order(order_entity):
            nonlocal created_order
            created_order = order_entity
            return order_factory(
                id=1,
                total_amount=order_entity.total_amount,
                idempotency_key=idempotency_key
            )
        
        mock_order_repository.create.side_effect = capture_order
        
        # Act
        result = use_case.create_order(order_data, idempotency_key)
        
        # Assert: Total calculado corretamente
        assert created_order is not None
        assert created_order.total_amount == Decimal("65.00")  # 20.00 + 45.00
        
        # Assert: Items têm line_total correto
        assert created_order.items[0].line_total == Decimal("20.00")
        assert created_order.items[1].line_total == Decimal("45.00")
    
    def test_get_order_by_id_sucesso(
        self,
        use_case,
        order_factory,
        mock_order_repository
    ):
        """Deve buscar pedido por ID com sucesso."""
        # Arrange
        order_id = 1
        order = order_factory(id=order_id)
        mock_order_repository.get_by_id.return_value = order
        
        # Act
        result = use_case.get_order_by_id(order_id)
        
        # Assert
        assert result.id == order_id
        mock_order_repository.get_by_id.assert_called_once_with(order_id)
    
    def test_list_orders_paginacao(
        self,
        use_case,
        order_factory,
        mock_order_repository
    ):
        """Deve listar pedidos com paginação correta."""
        # Arrange
        page = 2
        page_size = 10
        
        # Mock: 25 pedidos no total
        orders = [order_factory(id=i) for i in range(1, 11)]
        total = 25
        mock_order_repository.list_all.return_value = (orders, total)
        
        # Act
        result = use_case.list_orders(page=page, page_size=page_size)
        
        # Assert
        assert len(result.items) == 10
        assert result.total == 25
        assert result.page == 2
        assert result.page_size == 10
        assert result.total_pages == 3  # 25 / 10 = 3 páginas
        
        # Verificar skip correto
        mock_order_repository.list_all.assert_called_once_with(
            skip=10,  # (page-1) * page_size = (2-1) * 10 = 10
            limit=10,
            customer_id=None
        )

"""
Testes unitários para OrderUseCases - Status Management.
"""

import pytest
from unittest.mock import MagicMock
from src.application.use_cases.order_use_cases import OrderUseCases
from src.core.constants import OrderStatus
from src.domain.exceptions.business_exceptions import (
    OrderNotFoundException,
    OrderCannotBeCancelledException,
    OrderCannotBePaidException
)


class TestCancelOrder:
    """Testes para cancelamento de pedidos."""
    
    def test_cancel_order_success(
        self,
        order_factory,
        mock_order_repository,
        mock_product_repository,
        mock_customer_repository,
        mock_db_session
    ):
        """Deve cancelar pedido com sucesso."""
        order = order_factory(status=OrderStatus.CREATED.value)
        mock_order_repository.get_by_id.return_value = order
        mock_order_repository.update.return_value = order
        
        use_cases = OrderUseCases(
            order_repository=mock_order_repository,
            product_repository=mock_product_repository,
            customer_repository=mock_customer_repository,
            db=mock_db_session
        )
        
        result = use_cases.cancel_order(order.id)
        
        assert result.status == OrderStatus.CANCELLED.value
        mock_order_repository.get_by_id.assert_called_once_with(order.id)
        mock_order_repository.update.assert_called_once()
    
    def test_cancel_order_not_found(
        self,
        mock_order_repository,
        mock_product_repository,
        mock_customer_repository,
        mock_db_session
    ):
        """Deve lançar exceção quando pedido não existe."""
        mock_order_repository.get_by_id.return_value = None
        
        use_cases = OrderUseCases(
            order_repository=mock_order_repository,
            product_repository=mock_product_repository,
            customer_repository=mock_customer_repository,
            db=mock_db_session
        )
        
        with pytest.raises(OrderNotFoundException):
            use_cases.cancel_order(999)
    
    def test_cancel_order_when_paid_raises_exception(
        self,
        order_factory,
        mock_order_repository,
        mock_product_repository,
        mock_customer_repository,
        mock_db_session
    ):
        """Deve lançar exceção ao tentar cancelar pedido pago."""
        order = order_factory(status=OrderStatus.PAID.value)
        mock_order_repository.get_by_id.return_value = order
        
        use_cases = OrderUseCases(
            order_repository=mock_order_repository,
            product_repository=mock_product_repository,
            customer_repository=mock_customer_repository,
            db=mock_db_session
        )
        
        with pytest.raises(OrderCannotBeCancelledException):
            use_cases.cancel_order(order.id)


class TestMarkAsPaid:
    """Testes para marcar pedido como pago."""
    
    def test_mark_as_paid_success(
        self,
        order_factory,
        mock_order_repository,
        mock_product_repository,
        mock_customer_repository,
        mock_db_session
    ):
        """Deve marcar pedido como pago com sucesso."""
        order = order_factory(status=OrderStatus.CREATED.value)
        mock_order_repository.get_by_id.return_value = order
        mock_order_repository.update.return_value = order
        
        use_cases = OrderUseCases(
            order_repository=mock_order_repository,
            product_repository=mock_product_repository,
            customer_repository=mock_customer_repository,
            db=mock_db_session
        )
        
        result = use_cases.mark_as_paid(order.id)
        
        assert result.status == OrderStatus.PAID.value
        mock_order_repository.get_by_id.assert_called_once_with(order.id)
        mock_order_repository.update.assert_called_once()
    
    def test_mark_as_paid_not_found(
        self,
        mock_order_repository,
        mock_product_repository,
        mock_customer_repository,
        mock_db_session
    ):
        """Deve lançar exceção quando pedido não existe."""
        mock_order_repository.get_by_id.return_value = None
        
        use_cases = OrderUseCases(
            order_repository=mock_order_repository,
            product_repository=mock_product_repository,
            customer_repository=mock_customer_repository,
            db=mock_db_session
        )
        
        with pytest.raises(OrderNotFoundException):
            use_cases.mark_as_paid(999)
    
    def test_mark_as_paid_when_cancelled_raises_exception(
        self,
        order_factory,
        mock_order_repository,
        mock_product_repository,
        mock_customer_repository,
        mock_db_session
    ):
        """Deve lançar exceção ao tentar marcar como pago pedido cancelado."""
        order = order_factory(status=OrderStatus.CANCELLED.value)
        mock_order_repository.get_by_id.return_value = order
        
        use_cases = OrderUseCases(
            order_repository=mock_order_repository,
            product_repository=mock_product_repository,
            customer_repository=mock_customer_repository,
            db=mock_db_session
        )
        
        with pytest.raises(OrderCannotBePaidException):
            use_cases.mark_as_paid(order.id)
    
    def test_mark_as_paid_when_already_paid_raises_exception(
        self,
        order_factory,
        mock_order_repository,
        mock_product_repository,
        mock_customer_repository,
        mock_db_session
    ):
        """Deve lançar exceção ao tentar marcar como pago pedido já pago."""
        order = order_factory(status=OrderStatus.PAID.value)
        mock_order_repository.get_by_id.return_value = order
        
        use_cases = OrderUseCases(
            order_repository=mock_order_repository,
            product_repository=mock_product_repository,
            customer_repository=mock_customer_repository,
            db=mock_db_session
        )
        
        with pytest.raises(OrderCannotBePaidException):
            use_cases.mark_as_paid(order.id)