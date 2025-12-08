"""
Configuração de logs estruturados usando structlog.

Este módulo configura o structlog para:
- Logs em formato JSON (produção)
- Logs coloridos e legíveis (desenvolvimento)
- Contexto automático (timestamp, level, logger_name)
- Integração com logging padrão do Python
"""

import logging
import sys
from typing import Any

import structlog
from structlog.types import EventDict, Processor


def add_app_context(logger: Any, method_name: str, event_dict: EventDict) -> EventDict:
    """
    Adiciona contexto da aplicação aos logs.
    
    Args:
        logger: Logger do structlog
        method_name: Nome do método de log (info, error, etc)
        event_dict: Dicionário com dados do evento
        
    Returns:
        Dicionário atualizado com contexto adicional
    """
    event_dict["app"] = "topsaude-api"
    return event_dict


def configure_structlog(log_level: str = "INFO", json_logs: bool = False) -> None:
    """
    Configura o structlog para toda a aplicação.
    
    Args:
        log_level: Nível de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        json_logs: Se True, usa formato JSON. Se False, usa formato legível colorido.
    
    Exemplo de uso:
        # Desenvolvimento (logs coloridos)
        configure_structlog(log_level="DEBUG", json_logs=False)
        
        # Produção (logs JSON)
        configure_structlog(log_level="INFO", json_logs=True)
    """
    # Configurar logging padrão do Python
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, log_level.upper()),
    )
    
    # Lista de processadores do structlog
    processors: list[Processor] = [
        # Adiciona contexto personalizado
        add_app_context,
        
        # Adiciona nome do logger
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        
        # Adiciona timestamp ISO8601
        structlog.processors.TimeStamper(fmt="iso"),
        
        # Adiciona informações de stack em exceções
        structlog.processors.StackInfoRenderer(),
        
        # Formata exceções de forma legível
        structlog.processors.format_exc_info,
        
        # Decodifica unicode
        structlog.processors.UnicodeDecoder(),
    ]
    
    # Escolher formato final baseado no ambiente
    if json_logs:
        # Produção: JSON
        processors.append(structlog.processors.JSONRenderer())
    else:
        # Desenvolvimento: Colorido e legível
        processors.append(
            structlog.dev.ConsoleRenderer(
                colors=True,
                exception_formatter=structlog.dev.plain_traceback,
            )
        )
    
    # Configurar structlog
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str = __name__) -> structlog.stdlib.BoundLogger:
    """
    Obtém um logger estruturado.
    
    Args:
        name: Nome do logger (geralmente __name__ do módulo)
        
    Returns:
        Logger estruturado configurado
        
    Exemplo de uso:
        logger = get_logger(__name__)
        logger.info("usuario_criado", user_id=123, email="user@example.com")
        logger.error("erro_validacao", error="Email inválido", field="email")
    """
    return structlog.get_logger(name)