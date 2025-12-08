"""
Entidade Customer do domínio.
"""
from datetime import datetime
from typing import Optional
import re


class CustomerEntity:
    """
    Entidade de Cliente.
    Contém regras de negócio relacionadas a clientes.
    """
    
    def __init__(
        self,
        id: Optional[int],
        name: str,
        email: str,
        document: str,
        is_active: bool = True,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.id = id
        self.name = name
        self.email = email
        self.document = document
        self.is_active = is_active
        self.created_at = created_at
        self.updated_at = updated_at
    
    def validate(self) -> None:
        """Valida regras de negócio do cliente."""
        if not self.name or len(self.name.strip()) == 0:
            raise ValueError("Nome do cliente é obrigatório")
        
        if not self.is_valid_email(self.email):
            raise ValueError("Email inválido")
        
        if not self.is_valid_document(self.document):
            raise ValueError("Documento inválido (CPF ou CNPJ)")
    
    @staticmethod
    def is_valid_email(email: str) -> bool:
        """Valida formato de email."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def is_valid_document(document: str) -> bool:
        """Valida CPF ou CNPJ (apenas números)."""
        # Remove caracteres não numéricos
        doc = re.sub(r'[^0-9]', '', document)
        
        # CPF tem 11 dígitos, CNPJ tem 14
        return len(doc) in [11, 14]
    
    @staticmethod
    def format_document(document: str) -> str:
        """Formata documento removendo caracteres especiais."""
        return re.sub(r'[^0-9]', '', document)