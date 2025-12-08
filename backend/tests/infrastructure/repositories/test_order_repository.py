"""
Testes unitários para OrderRepository.
Valida conversões Entity ↔ Model e operações de banco.
"""

import pytest
from decimal import Decimal
from unittest.mock import MagicMock, Mock, call
from datetime import datetime

from src.infrastructure.repositories.order_repository import OrderRepository
from src.infrastructure.database.models import Order, OrderItem
from src.domain.entities.order import OrderEntity
from src.domain.entities.order_item import OrderItemEntity
from src.core.constants import OrderStatus


class TestOrderRepository:
    """Testes do OrderRepository."""
    
    # ==========================================
    # FIXTURES LOCAIS
    # ==========================================
    
    @pytest.fixture
    def mock_db_session(self):
        """Mock da sessão do banco de dados."""
        mock = MagicMock()
        mock.query = MagicMock()
        mock.add = MagicMock()
        mock.commit = MagicMock()
        mock.refresh = MagicMock()
        mock.flush = MagicMock()
        return mock
    
    @pytest.fixture
    def repository(self, mock_db_session):
        """Instância do OrderRepository com mock."""
        return OrderRepository(mock_db_session)
    
    @pytest.fixture
    def order_model_sample(self):
        """Model de exemplo para testes."""
        # Criar items
        item1 = OrderItem(
            id=1,
            order_id=1,
            product_id=10,
            unit_price=15.50,
            quantity=2,
            line_total=31.00
        )
        item2 = OrderItem(
            id=2,
            order_id=1,
            product_id=20,
            unit_price=25.00,
            quantity=3,
            line_total=75.00
        )
        
        # Criar order
        order = Order(
            id=1,
            customer_id=5,
            total_amount=106.00,
            status=OrderStatus.CREATED.value,
            idempotency_key="test-key-123",
            created_at=datetime(2024, 1, 15, 10, 30, 0),
            updated_at=None,
            items=[item1, item2]
        )
        return order
    
    # ==========================================
    # TESTES DE CONVERSÃO
    # ==========================================
    '''   
    def test_to_model_converte_entity_corretamente(
        self,
        repository,
        order_factory,
        order_item_factory
    ):
        """Deve converter OrderEntity para Order corretamente."""
        # Arrange
        items = [
            order_item_factory(
                id=None,
                product_id=10,
                unit_price=Decimal("15.50"),
                quantity=2,
                line_total=Decimal("31.00")
            ),
            order_item_factory(
                id=None,
                product_id=20,
                unit_price=Decimal("25.00"),
                quantity=3,
                line_total=Decimal("75.00")
            )
        ]
        
        order_entity = order_factory(
            id=None,
            customer_id=5,
            total_amount=Decimal("106.00"),
            status=OrderStatus.CREATED.value,
            idempotency_key="test-key-456",
            items=items
        )
        
        # Act
        order_model = repository._to_model(order_entity)
        
        # Assert - Dados do pedido
        assert order_model.customer_id == 5
        assert order_model.total_amount == 106.00
        assert order_model.status == OrderStatus.CREATED.value
        assert order_model.idempotency_key == "test-key-456"
        
        # Assert - Items
        assert len(order_model.items) == 2
        
        # Item 1
        assert order_model.items[0].product_id == 10
        assert order_model.items[0].unit_price == 15.50
        assert order_model.items[0].quantity == 2
        assert order_model.items[0].line_total == 31.00
        
        # Item 2
        assert order_model.items[1].product_id == 20
        assert order_model.items[1].unit_price == 25.00
        assert order_model.items[1].quantity == 3
        assert order_model.items[1].line_total == 75.00
    '''

    def test_to_entity_converte_model_corretamente(
        self,
        repository,
        order_model_sample
    ):
        """Deve converter Order para OrderEntity corretamente."""
        # Act
        order_entity = repository._to_entity(order_model_sample)
        
        # Assert - Dados do pedido
        assert order_entity.id == 1
        assert order_entity.customer_id == 5
        assert order_entity.total_amount == Decimal("106.00")
        assert order_entity.status == OrderStatus.CREATED.value
        assert order_entity.idempotency_key == "test-key-123"
        assert order_entity.created_at == datetime(2024, 1, 15, 10, 30, 0)
        assert order_entity.updated_at is None
        
        # Assert - Items
        assert len(order_entity.items) == 2
        
        # Item 1
        assert order_entity.items[0].id == 1
        assert order_entity.items[0].order_id == 1
        assert order_entity.items[0].product_id == 10
        assert order_entity.items[0].unit_price == Decimal("15.50")
        assert order_entity.items[0].quantity == 2
        assert order_entity.items[0].line_total == Decimal("31.00")
        
        # Item 2
        assert order_entity.items[1].id == 2
        assert order_entity.items[1].order_id == 1
        assert order_entity.items[1].product_id == 20
        assert order_entity.items[1].unit_price == Decimal("25.00")
        assert order_entity.items[1].quantity == 3
        assert order_entity.items[1].line_total == Decimal("75.00")
    
    # ==========================================
    # TESTES DE BUSCA
    # ==========================================
    
    def test_get_by_id_retorna_entity(
        self,
        repository,
        mock_db_session,
        order_model_sample
    ):
        """Deve buscar pedido por ID e retornar Entity."""
        # Arrange
        order_id = 1
        
        # Mock query chain
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = order_model_sample
        mock_db_session.query.return_value = mock_query
        
        # Act
        result = repository.get_by_id(order_id)
        
        # Assert
        assert result is not None
        assert isinstance(result, OrderEntity)
        assert result.id == 1
        assert result.customer_id == 5
        assert result.total_amount == Decimal("106.00")
        assert len(result.items) == 2
        
        # Verificar que query foi chamada corretamente
        mock_db_session.query.assert_called_once()
    
    def test_get_by_idempotency_key_retorna_entity(
        self,
        repository,
        mock_db_session,
        order_model_sample
    ):
        """Deve buscar pedido por idempotency_key e retornar Entity."""
        # Arrange
        idempotency_key = "test-key-123"
        
        # Mock query chain
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = order_model_sample
        mock_db_session.query.return_value = mock_query
        
        # Act
        result = repository.get_by_idempotency_key(idempotency_key)
        
        # Assert
        assert result is not None
        assert isinstance(result, OrderEntity)
        assert result.idempotency_key == "test-key-123"
        assert result.id == 1
        
        # Verificar que query foi chamada corretamente
        mock_db_session.query.assert_called_once()
    
    def test_get_by_id_retorna_none_se_nao_encontrado(
        self,
        repository,
        mock_db_session
    ):
        """Deve retornar None se pedido não existir."""
        # Arrange
        order_id = 999
        
        # Mock query chain (retorna None)
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = None
        mock_db_session.query.return_value = mock_query
        
        # Act
        result = repository.get_by_id(order_id)
        
        # Assert
        assert result is None
    
    # ==========================================
    # TESTES DE CRIAÇÃO
    # ==========================================
    
    def test_create_persiste_pedido_com_transacao(
        self,
        repository,
        mock_db_session,
        order_factory,
        order_item_factory
    ):
        """Deve criar pedido com transação atômica."""
        # Arrange
        items = [
            order_item_factory(product_id=10, quantity=2),
            order_item_factory(product_id=20, quantity=3)
        ]
        order_entity = order_factory(
            id=None,
            customer_id=5,
            items=items,
            idempotency_key="create-test"
        )
        
        # Mock: Simular que após add, o model recebe ID
        def mock_add_side_effect(model):
            # Verifica se o objeto sendo adicionado é o Pedido (que tem a lista de itens)
            if hasattr(model, 'idempotency_key'):
                model.id = 1
                from src.infrastructure.database.models import OrderItem
                model.items = [
                    OrderItem(id=1, product_id=10, unit_price=15.50, quantity=2, line_total=31.00),
                    OrderItem(id=2, product_id=20, unit_price=25.00, quantity=3, line_total=75.00)
                    ]
            elif hasattr(model, 'product_id'):
                model.id = 1
        
        mock_db_session.add.side_effect = mock_add_side_effect
        
        # Mock refresh para simular reload do banco
        def mock_refresh_side_effect(model):
            # Já tem os IDs setados pelo add
            pass
        
        mock_db_session.refresh.side_effect = mock_refresh_side_effect
        
        # Act
        result = repository.create(order_entity)
        
        # Assert
        assert result is not None
        assert isinstance(result, OrderEntity)
        assert result.id == 1
        assert result.customer_id == 5
        assert len(result.items) == 2
        
        # Verificar que add e commit foram chamados
        assert mock_db_session.add.call_count == 3
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()
    
    # ==========================================
    # TESTES DE LISTAGEM
    # ==========================================
    
    def test_list_all_retorna_tupla_com_total(
        self,
        repository,
        mock_db_session,
        order_model_sample
    ):
        """Deve retornar tupla (lista, total) na listagem."""
        # 1. Criar o mock da query principal que suporta todos os métodos encadeados
        mock_query = MagicMock()
        
        # 2. Configurar o encadeamento para que cada método retorne o próprio mock
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        
        # 3. Definir os retornos dos métodos executores (count e all)
        mock_query.count.return_value = 25
        mock_query.all.return_value = [order_model_sample]
        
        # 4. Configurar a sessão para retornar este mock em qualquer chamada de query
        mock_db_session.query.return_value = mock_query
        mock_db_session.query.side_effect = None  # Limpa qualquer side_effect anterior

        # Act
        result = repository.list_all(skip=0, limit=10)
        
        # Assert
        assert isinstance(result, tuple)
        assert len(result) == 2
        
        orders, total = result
        
        # Verificar lista de orders (convertidas para Entity)
        assert len(orders) == 1
        assert isinstance(orders[0], OrderEntity)
        assert orders[0].id == 1
        
        # Verificar total retornado pelo count()
        assert total == 25
        
        # Como o objeto query é reaproveitado pelo repositório, validamos
        # que a sessão abriu a query para Order uma vez
        assert mock_db_session.query.call_count == 1