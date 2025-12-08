"""
DTOs (Data Transfer Objects) para Cliente.
Define os contratos de entrada e saída da API.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator
import re


class CustomerBase(BaseModel):
    """Schema base de cliente (campos compartilhados)."""
    name: str = Field(..., min_length=1, max_length=255, description="Nome do cliente")
    email: str = Field(..., max_length=255, description="Email do cliente")
    document: str = Field(..., description="CPF ou CNPJ")
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Valida formato de email."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, v):
            raise ValueError('Email inválido')
        return v.lower()  # Normalizar para minúsculas
    
    @field_validator('document')
    @classmethod
    def validate_document(cls, v: str) -> str:
        """Valida CPF ou CNPJ (apenas números)."""
        # Remove caracteres não numéricos
        doc = re.sub(r'[^0-9]', '', v)
        
        # CPF tem 11 dígitos, CNPJ tem 14
        if len(doc) not in [11, 14]:
            raise ValueError('Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)')
        
        return doc


class CustomerCreate(CustomerBase):
    """
    Schema para criação de cliente.
    Usado no endpoint POST /api/customers
    """
    pass


class CustomerUpdate(BaseModel):
    """
    Schema para atualização de cliente.
    Usado no endpoint PUT /api/customers/{id}
    Todos os campos são opcionais.
    """
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    document: Optional[str] = Field(None, description="CPF ou CNPJ")
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        """Valida formato de email."""
        if v is None:
            return v
        
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, v):
            raise ValueError('Email inválido')
        return v.lower()
    
    @field_validator('document')
    @classmethod
    def validate_document(cls, v: Optional[str]) -> Optional[str]:
        """Valida CPF ou CNPJ."""
        if v is None:
            return v
        
        # Remove caracteres não numéricos
        doc = re.sub(r'[^0-9]', '', v)
        
        # CPF tem 11 dígitos, CNPJ tem 14
        if len(doc) not in [11, 14]:
            raise ValueError('Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)')
        
        return doc


class CustomerResponse(CustomerBase):
    """
    Schema de resposta de cliente.
    Retornado pela API em GET, POST, PUT.
    """
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # Permite criar do ORM model


class CustomerListResponse(BaseModel):
    """
    Schema para listagem paginada de clientes.
    Retornado por GET /api/customers
    """
    items: list[CustomerResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "items": [
                    {
                        "id": 1,
                        "name": "João Silva",
                        "email": "joao@email.com",
                        "document": "12345678901",
                        "created_at": "2024-12-06T10:00:00",
                        "updated_at": None
                    }
                ],
                "total": 1,
                "page": 1,
                "page_size": 20,
                "total_pages": 1
            }
        }