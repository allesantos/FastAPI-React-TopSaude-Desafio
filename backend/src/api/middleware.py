"""
Middleware personalizado para logging de requisições HTTP.

Este middleware captura e loga:
- Todas as requisições (método, path, query params)
- Tempo de processamento
- Status code da resposta
- Erros e exceções com contexto completo
"""

import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from src.infrastructure.logging.logger import get_logger

logger = get_logger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware para logging estruturado de todas as requisições HTTP.
    
    Captura:
    - Método HTTP (GET, POST, PUT, DELETE, etc)
    - Path da requisição
    - Query parameters
    - Status code da resposta
    - Tempo de processamento (em milissegundos)
    - Erros e exceções
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Processa a requisição e adiciona logging.
        
        Args:
            request: Requisição HTTP recebida
            call_next: Próximo middleware/handler na cadeia
            
        Returns:
            Resposta HTTP
        """
        # Marcar início do processamento
        start_time = time.time()
        
        # Extrair informações da requisição
        method = request.method
        path = request.url.path
        query_params = dict(request.query_params) if request.query_params else {}
        
        # Log da requisição recebida
        logger.info(
            "request_received",
            method=method,
            path=path,
            query_params=query_params if query_params else None,
        )
        
        # Processar requisição
        try:
            response = await call_next(request)
            
            # Calcular tempo de processamento
            process_time = (time.time() - start_time) * 1000  # em milissegundos
            
            # Log da resposta enviada
            logger.info(
                "request_completed",
                method=method,
                path=path,
                status_code=response.status_code,
                process_time_ms=round(process_time, 2),
            )
            
            return response
            
        except Exception as exc:
            # Calcular tempo até o erro
            process_time = (time.time() - start_time) * 1000
            
            # Log do erro com contexto completo
            logger.error(
                "request_failed",
                method=method,
                path=path,
                query_params=query_params if query_params else None,
                process_time_ms=round(process_time, 2),
                error=str(exc),
                error_type=type(exc).__name__,
                exc_info=True,  # Inclui traceback completo
            )
            
            # Re-lançar exceção para FastAPI tratar
            raise