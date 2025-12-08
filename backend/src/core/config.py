"""
Configurações centralizadas da aplicação.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path

# Encontrar a pasta raiz do projeto
# backend/src/core/config.py -> core -> src -> backend -> RAIZ
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent  # 4 níveis!
ENV_FILE = ROOT_DIR / ".env"


class Settings(BaseSettings):
    """Configurações da aplicação."""
    
    # Banco de Dados
    DATABASE_URL: str
    
    # Aplicação
    APP_NAME: str = "TopSaude Hub API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # Servidor
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # Logs
    LOG_LEVEL: str = "INFO"  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    
    class Config:
        env_file = str(ENV_FILE)
        case_sensitive = True
        extra = "ignore"
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Retorna lista de origens permitidas para CORS."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """
    Retorna instância única de configurações (Singleton).
    Usa cache para evitar recriar o objeto a cada chamada.
    """
    return Settings() # type: ignore


# Instância global de configurações
settings = get_settings()

# Debug
if settings.DEBUG:
    print(f"🔍 Buscando .env em: {ENV_FILE}")
    print(f"📁 Arquivo existe? {ENV_FILE.exists()}")
    if ENV_FILE.exists():
        print(f"✅ .env carregado com sucesso!")