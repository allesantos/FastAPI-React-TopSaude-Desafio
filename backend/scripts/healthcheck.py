"""
Script para verificar saúde da aplicação.
Usado pelo Docker healthcheck.
"""
import sys
import httpx


def check_health():
    """Verifica se a API está respondendo."""
    try:
        response = httpx.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ API está saudável!")
            sys.exit(0)
        else:
            print(f"❌ API retornou status {response.status_code}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Erro ao verificar saúde: {e}")
        sys.exit(1)


if __name__ == "__main__":
    check_health()