"""
Envelope de resposta padrão para todas as APIs.
Garante consistência nas respostas HTTP.
"""
from typing import Any, Optional
from pydantic import BaseModel
from src.core.constants import ResponseCode


class ResponseEnvelope(BaseModel):
    """
    Envelope padrão de resposta da API.
    
    Formato:
    {
        "cod_retorno": 0,  # 0 = sucesso, 1 = erro
        "mensagem": "Operação realizada com sucesso",
        "data": {...}  # Dados da resposta (opcional)
    }
    """
    cod_retorno: int
    mensagem: str
    data: Optional[Any] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "cod_retorno": 0,
                "mensagem": "Produto criado com sucesso",
                "data": {
                    "id": 1,
                    "name": "Produto Teste",
                    "sku": "SKU001"
                }
            }
        }


def success_response(message: str, data: Any = None) -> dict:
    """
    Cria resposta de sucesso.
    
    Args:
        message: Mensagem de sucesso
        data: Dados da resposta
    
    Returns:
        ResponseEnvelope com cod_retorno=0
    """
    return ResponseEnvelope(
        cod_retorno=ResponseCode.SUCCESS.value,
        mensagem=message,
        data=data
    ).model_dump()


def error_response(message: str, data: Any = None) -> dict:
    """
    Cria resposta de erro.
    
    Args:
        message: Mensagem de erro
        data: Dados adicionais sobre o erro (opcional)
    
    Returns:
        ResponseEnvelope com cod_retorno=1
    """
    return ResponseEnvelope(
        cod_retorno=ResponseCode.ERROR.value,
        mensagem=message,
        data=data
     ).model_dump()