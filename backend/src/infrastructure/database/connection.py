"""
Configuração da conexão com o banco de dados.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from src.core.config import settings

# Engine do SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Log de queries SQL em modo debug
    pool_pre_ping=True,   # Verifica conexão antes de usar
    pool_size=10,         # Pool de conexões
    max_overflow=20       # Conexões extras permitidas
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base para os models
Base = declarative_base()


def get_db():
    """
    Dependency para obter sessão do banco de dados.
    Usado no FastAPI para injeção de dependência.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()