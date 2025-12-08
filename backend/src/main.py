"""
Arquivo principal da aplicação FastAPI.
"""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.api.routes import health, products, customers, orders
from src.api.response_envelope import error_response

# Importar configuração de logs
from src.infrastructure.logging.logger import configure_structlog, get_logger

# Importar middleware de logging
from src.api.middleware import LoggingMiddleware


# Configurar logs estruturados ANTES de criar o app
configure_structlog(
    log_level=settings.LOG_LEVEL,
    json_logs=False  # False = logs coloridos (dev), True = JSON (prod)
)

# Criar logger para este módulo
logger = get_logger(__name__)


# Criar instância do FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Adicionar middleware de logging (DEPOIS do CORS)
app.add_middleware(LoggingMiddleware)


# ===== EXCEPTION HANDLERS =====

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Captura erros de validação do Pydantic (RequestValidationError)
    e retorna no formato de envelope padrão.
    
    Exemplos de erros capturados:
    - Campos obrigatórios faltando
    - Tipos incorretos (string em vez de número)
    - Validações de range (gt, ge, lt, le)
    - Validações customizadas (@field_validator)
    """
    errors = exc.errors()
    
    if errors:
        first_error = errors[0]
        
        # Extrair nome do campo
        field_location = first_error.get('loc', [])
        field_name = field_location[-1] if field_location else 'campo'
        
        # Extrair tipo de erro e mensagem
        error_type = first_error.get('type', '')
        error_msg = first_error.get('msg', '')
        
        # Extrair contexto (valores esperados)
        ctx = first_error.get('ctx', {})
        
        # ===== MENSAGENS CUSTOMIZADAS EM PORTUGUÊS =====
        
        # Erros de valor (greater_than, less_than, etc)
        if 'greater_than' in error_type:
            if 'gt' in ctx:
                mensagem = f"{field_name.replace('_', ' ').title()} deve ser maior que {ctx['gt']}"
            else:
                mensagem = f"{field_name.replace('_', ' ').title()} deve ser positivo"
        
        elif 'greater_than_equal' in error_type:
            if 'ge' in ctx:
                mensagem = f"{field_name.replace('_', ' ').title()} deve ser maior ou igual a {ctx['ge']}"
            else:
                mensagem = f"{field_name.replace('_', ' ').title()} não pode ser negativo"
        
        elif 'less_than_equal' in error_type:
            mensagem = f"{field_name.replace('_', ' ').title()} excede o valor máximo permitido"
        
        # Erros de tipo
        elif 'string_type' in error_type:
            mensagem = f"{field_name.replace('_', ' ').title()} deve ser texto"
        
        elif 'int_type' in error_type or 'integer_type' in error_type:
            mensagem = f"{field_name.replace('_', ' ').title()} deve ser um número inteiro"
        
        elif 'float_type' in error_type or 'decimal_type' in error_type:
            mensagem = f"{field_name.replace('_', ' ').title()} deve ser um número"
        
        elif 'bool_type' in error_type:
            mensagem = f"{field_name.replace('_', ' ').title()} deve ser verdadeiro ou falso"
        
        # Erros de obrigatoriedade
        elif 'missing' in error_type:
            mensagem = f"Campo obrigatório: {field_name.replace('_', ' ')}"
        
        # Erros de string (tamanho)
        elif 'string_too_short' in error_type:
            min_length = ctx.get('min_length', 1)
            mensagem = f"{field_name.replace('_', ' ').title()} deve ter no mínimo {min_length} caracteres"
        
        elif 'string_too_long' in error_type:
            max_length = ctx.get('max_length', 255)
            mensagem = f"{field_name.replace('_', ' ').title()} deve ter no máximo {max_length} caracteres"
        
        # Erros de validação customizada (ValueError dos @field_validator)
        elif 'value_error' in error_type:
            # Pegar mensagem customizada do ValueError
            mensagem = error_msg if error_msg else f"Erro de validação no campo {field_name}"
        
        # Erros de parsing do body
        elif 'json_invalid' in error_type or 'parsing' in error_msg.lower():
            mensagem = "Formato JSON inválido. Verifique a sintaxe dos dados enviados"
        
        # Outros erros genéricos
        else:
            mensagem = f"Erro de validação no campo {field_name.replace('_', ' ')}: {error_msg}"
    
    else:
        mensagem = "Erro de validação nos dados enviados"
    
    # Logar erro de validação
    logger.warning(
        "validation_error",
        path=request.url.path,
        method=request.method,
        error_message=mensagem,
        error_details=errors[0] if errors else None
    )
    
    # Retornar envelope padrão de erro (DICT, não objeto)
    return JSONResponse(
        status_code=400,
        content={
            "cod_retorno": 1,
            "mensagem": mensagem,
            "data": None
        }
    )


# ===== REGISTRAR ROTAS =====

app.include_router(health.router)
app.include_router(products.router, prefix="/api")
app.include_router(customers.router, prefix="/api") 
app.include_router(orders.router, prefix="/api") 


# ===== EVENTOS DE LIFECYCLE =====

@app.on_event("startup")
async def startup_event():
    """Evento executado ao iniciar a aplicação."""
    # ← ✨ MODIFICADO! Usar logger estruturado
    logger.info(
        "app_startup",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        debug=settings.DEBUG
    )
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} iniciando...")
    print(f"📊 Ambiente: {settings.ENVIRONMENT}")
    print(f"🐛 Debug: {settings.DEBUG}")


@app.on_event("shutdown")
async def shutdown_event():
    """Evento executado ao desligar a aplicação."""
    # ← ✨ MODIFICADO! Usar logger estruturado
    logger.info("app_shutdown")
    print("👋 Encerrando aplicação...")