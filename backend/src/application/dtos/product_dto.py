"""
DTOs (Data Transfer Objects) para Produto.
Define os contratos de entrada e saída da API.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class ProductBase(BaseModel):
    """Schema base de produto (campos compartilhados)."""
    name: str = Field(..., min_length=1, max_length=255, description="Nome do produto")
    sku: str = Field(..., min_length=1, max_length=100, description="SKU único do produto")
    price: float = Field(..., description="Preço do produto")
    stock_qty: int = Field(..., ge=0, description="Quantidade em estoque")
    is_active: bool = Field(default=True, description="Produto ativo?")
    
    @field_validator('price')
    @classmethod
    def validate_price(cls, v: float) -> float:
        """
        Valida se o preço é positivo.
        
        Agora usando float em vez de Decimal para evitar problemas
        de parsing com valores negativos e decimais.
        """
        if v <= 0:
            raise ValueError('Preço deve ser maior que zero')
        return v
    
    @field_validator('stock_qty')
    @classmethod
    def validate_stock(cls, v: int) -> int:
        """Valida se o estoque não é negativo."""
        if v < 0:
            raise ValueError('Quantidade em estoque não pode ser negativa')
        return v


class ProductCreate(ProductBase):
    """
    Schema para criação de produto.
    Usado no endpoint POST /api/products
    """
    pass


class ProductUpdate(BaseModel):
    """
    Schema para atualização de produto.
    Usado no endpoint PUT /api/products/{id}
    Todos os campos são opcionais.
    """
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, description="Preço do produto")
    stock_qty: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    
    @field_validator('price')
    @classmethod
    def validate_price(cls, v: Optional[float]) -> Optional[float]:
        """Valida se o preço é positivo."""
        if v is not None and v <= 0:
            raise ValueError('Preço deve ser maior que zero')
        return v
    
    @field_validator('stock_qty')
    @classmethod
    def validate_stock(cls, v: Optional[int]) -> Optional[int]:
        """Valida se o estoque não é negativo."""
        if v is not None and v < 0:
            raise ValueError('Quantidade em estoque não pode ser negativa')
        return v


class ProductResponse(ProductBase):
    """
    Schema de resposta de produto.
    Retornado pela API em GET, POST, PUT.
    """
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # Permite criar do ORM model


class ProductListResponse(BaseModel):
    """
    Schema para listagem paginada de produtos.
    Retornado por GET /api/products
    """
    items: list[ProductResponse]
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
                        "name": "Produto 1",
                        "sku": "SKU001",
                        "price": 99.90,
                        "stock_qty": 10,
                        "is_active": True,
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