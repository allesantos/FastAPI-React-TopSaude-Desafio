"""
Endpoints de health check.
"""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """
    Endpoint de health check.
    Usado para verificar se a API está funcionando.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "TopSaude Hub API"
    }


@router.get("/")
async def root():
    """
    Endpoint raiz.
    Retorna informações básicas da API.
    """
    return {
        "message": "Bem-vindo ao TopSaude Hub API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }