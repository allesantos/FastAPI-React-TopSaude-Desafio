"""
Testes unitários para CustomerEntity.
Valida regras de negócio relacionadas a clientes.
"""

import pytest
from src.domain.entities.customer import CustomerEntity


class TestCustomerEntity:
    """Testes da entidade CustomerEntity."""
    
    def test_criar_cliente_valido(self, customer_factory):
        """Deve criar cliente válido com sucesso."""
        # Arrange & Act
        customer = customer_factory(
            name="João Silva",
            email="joao@email.com",
            document="12345678900"
        )
        
        # Assert
        assert customer.name == "João Silva"
        assert customer.email == "joao@email.com"
        assert customer.document == "12345678900"
        assert customer.is_active is True
    
    def test_validar_nome_obrigatorio(self, customer_factory):
        """Deve rejeitar cliente sem nome."""
        # Arrange
        customer = customer_factory(name="")
        
        # Act & Assert
        with pytest.raises(ValueError, match="Nome do cliente é obrigatório"):
            customer.validate()
    
    def test_validar_email_formato_invalido(self, customer_factory):
        """Deve rejeitar email com formato inválido."""
        # Arrange
        customer = customer_factory(email="email_invalido")
        
        # Act & Assert
        with pytest.raises(ValueError, match="Email inválido"):
            customer.validate()
    
    def test_validar_email_formato_valido(self):
        """Deve aceitar emails com formato válido."""
        # Assert
        assert CustomerEntity.is_valid_email("teste@email.com") is True
        assert CustomerEntity.is_valid_email("usuario.teste@empresa.com.br") is True
        assert CustomerEntity.is_valid_email("user+tag@domain.co") is True
    
    def test_validar_documento_cpf_valido(self):
        """Deve aceitar CPF válido (11 dígitos)."""
        # Assert
        assert CustomerEntity.is_valid_document("12345678900") is True
        assert CustomerEntity.is_valid_document("123.456.789-00") is True
    
    def test_validar_documento_cnpj_valido(self):
        """Deve aceitar CNPJ válido (14 dígitos)."""
        # Assert
        assert CustomerEntity.is_valid_document("12345678000190") is True
        assert CustomerEntity.is_valid_document("12.345.678/0001-90") is True
    
    def test_validar_documento_invalido(self, customer_factory):
        """Deve rejeitar documento com tamanho inválido."""
        # Arrange
        customer = customer_factory(document="123")  # Muito curto
        
        # Act & Assert
        with pytest.raises(ValueError, match="Documento inválido"):
            customer.validate()
    
    def test_format_document(self):
        """Deve remover caracteres especiais do documento."""
        # Act
        formatted = CustomerEntity.format_document("123.456.789-00")
        
        # Assert
        assert formatted == "12345678900"