"""
Script de seed para popular banco de dados com dados iniciais.

Este script cria:
- 20 produtos variados (medicamentos e produtos de saúde)
- 10 clientes com dados fictícios

Uso:
    python scripts/seed_data.py

Ou via Docker:
    docker compose exec backend python scripts/seed_data.py
"""

import sys
from pathlib import Path

# Adicionar diretório raiz ao path para imports funcionarem
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy.exc import IntegrityError
from src.infrastructure.database.connection import SessionLocal
from src.infrastructure.database.models import Product, Customer


def criar_produtos(session) -> None:
    """
    Cria 20 produtos variados no banco de dados.
    
    Produtos incluem:
    - Medicamentos comuns (analgésicos, antibióticos)
    - Vitaminas e suplementos
    - Produtos de higiene e cuidados pessoais
    
    Args:
        session: Sessão do SQLAlchemy
    """
    produtos = [
        # Analgésicos e Anti-inflamatórios
        {"name": "Paracetamol 500mg", "sku": "MED001", "price": 8.50, "stock_qty": 150},
        {"name": "Ibuprofeno 600mg", "sku": "MED002", "price": 12.90, "stock_qty": 100},
        {"name": "Dipirona 500mg", "sku": "MED003", "price": 6.75, "stock_qty": 200},
        {"name": "Aspirina 100mg", "sku": "MED004", "price": 9.30, "stock_qty": 80},
        
        # Antibióticos (uso controlado)
        {"name": "Amoxicilina 500mg", "sku": "MED005", "price": 15.80, "stock_qty": 60},
        {"name": "Azitromicina 500mg", "sku": "MED006", "price": 18.50, "stock_qty": 50},
        
        # Vitaminas e Suplementos
        {"name": "Vitamina C 1000mg", "sku": "VIT001", "price": 22.00, "stock_qty": 120},
        {"name": "Vitamina D 2000UI", "sku": "VIT002", "price": 28.90, "stock_qty": 90},
        {"name": "Complexo B", "sku": "VIT003", "price": 19.50, "stock_qty": 75},
        {"name": "Omega 3 1000mg", "sku": "VIT004", "price": 45.00, "stock_qty": 65},
        
        # Produtos para Gripe e Resfriado
        {"name": "Antigripal 500mg", "sku": "MED007", "price": 11.20, "stock_qty": 110},
        {"name": "Xarope Expectorante", "sku": "MED008", "price": 14.80, "stock_qty": 55},
        
        # Produtos de Higiene e Cuidados
        {"name": "Alcool Gel 70% 500ml", "sku": "HIG001", "price": 12.50, "stock_qty": 200},
        {"name": "Mascara Cirurgica Cx 50un", "sku": "HIG002", "price": 25.00, "stock_qty": 85},
        {"name": "Termometro Digital", "sku": "HIG003", "price": 18.90, "stock_qty": 45},
        
        # Produtos para Diabetes
        {"name": "Tiras Glicemia Cx 50un", "sku": "DIA001", "price": 89.90, "stock_qty": 30},
        {"name": "Lancetas Cx 100un", "sku": "DIA002", "price": 15.50, "stock_qty": 70},
        
        # Outros Produtos
        {"name": "Soro Fisiologico 500ml", "sku": "MED009", "price": 6.80, "stock_qty": 140},
        {"name": "Curativo Adesivo Cx 100un", "sku": "HIG004", "price": 8.90, "stock_qty": 95},
        {"name": "Luvas Latex Cx 100un", "sku": "HIG005", "price": 32.00, "stock_qty": 50},
    ]
    
    produtos_criados = 0
    produtos_existentes = 0
    
    for produto_data in produtos:
        # Verificar se produto já existe (por SKU)
        produto_existe = session.query(Product).filter_by(sku=produto_data["sku"]).first()
        
        if produto_existe:
            print(f"  ⚠️  Produto '{produto_data['name']}' (SKU: {produto_data['sku']}) já existe")
            produtos_existentes += 1
            continue
        
        # Criar novo produto
        produto = Product(
            name=produto_data["name"],
            sku=produto_data["sku"],
            price=produto_data["price"],
            stock_qty=produto_data["stock_qty"],
            is_active=True
        )
        
        session.add(produto)
        produtos_criados += 1
        print(f"  ✅ Produto criado: {produto_data['name']} (SKU: {produto_data['sku']})")
    
    # Commit de todos os produtos
    try:
        session.commit()
        print(f"\n✨ Total de produtos criados: {produtos_criados}")
        if produtos_existentes > 0:
            print(f"⚠️  Total de produtos que já existiam: {produtos_existentes}")
    except IntegrityError as e:
        session.rollback()
        print(f"\n❌ Erro ao criar produtos: {e}")
        raise


def criar_clientes(session) -> None:
    """
    Cria 10 clientes fictícios no banco de dados.
    
    Args:
        session: Sessão do SQLAlchemy
    """
    clientes = [
        {"name": "Maria Silva Santos", "email": "maria.santos@email.com", "document": "12345678901"},
        {"name": "Joao Pedro Oliveira", "email": "joao.oliveira@email.com", "document": "23456789012"},
        {"name": "Ana Carolina Costa", "email": "ana.costa@email.com", "document": "34567890123"},
        {"name": "Carlos Eduardo Souza", "email": "carlos.souza@email.com", "document": "45678901234"},
        {"name": "Fernanda Lima Alves", "email": "fernanda.alves@email.com", "document": "56789012345"},
        {"name": "Ricardo Mendes Rocha", "email": "ricardo.rocha@email.com", "document": "67890123456"},
        {"name": "Patricia Fernandes", "email": "patricia.fernandes@email.com", "document": "78901234567"},
        {"name": "Roberto Carlos Dias", "email": "roberto.dias@email.com", "document": "89012345678"},
        {"name": "Juliana Martins Pereira", "email": "juliana.pereira@email.com", "document": "90123456789"},
        {"name": "Paulo Henrique Gomes", "email": "paulo.gomes@email.com", "document": "01234567890"},
    ]
    
    clientes_criados = 0
    clientes_existentes = 0
    
    for cliente_data in clientes:
        # Verificar se cliente já existe (por email OU documento)
        cliente_existe = session.query(Customer).filter(
            (Customer.email == cliente_data["email"]) | 
            (Customer.document == cliente_data["document"])
        ).first()
        
        if cliente_existe:
            print(f"  ⚠️  Cliente '{cliente_data['name']}' já existe")
            clientes_existentes += 1
            continue
        
        # Criar novo cliente
        cliente = Customer(
            name=cliente_data["name"],
            email=cliente_data["email"],
            document=cliente_data["document"]
        )
        
        session.add(cliente)
        clientes_criados += 1
        print(f"  ✅ Cliente criado: {cliente_data['name']}")
    
    # Commit de todos os clientes
    try:
        session.commit()
        print(f"\n✨ Total de clientes criados: {clientes_criados}")
        if clientes_existentes > 0:
            print(f"⚠️  Total de clientes que já existiam: {clientes_existentes}")
    except IntegrityError as e:
        session.rollback()
        print(f"\n❌ Erro ao criar clientes: {e}")
        raise


def seed_database() -> None:
    """
    Função principal que executa o seed do banco de dados.
    
    Cria produtos e clientes em ordem, garantindo que não há duplicatas.
    """
    print("=" * 60)
    print("🌱 INICIANDO SEED DO BANCO DE DADOS")
    print("=" * 60)
    
    # Criar sessão do banco
    session = SessionLocal()
    
    try:
        # 1. Criar produtos
        print("\n📦 Criando produtos...")
        print("-" * 60)
        criar_produtos(session)
        
        # 2. Criar clientes
        print("\n👥 Criando clientes...")
        print("-" * 60)
        criar_clientes(session)
        
        print("\n" + "=" * 60)
        print("✅ SEED CONCLUÍDO COM SUCESSO!")
        print("=" * 60)
        
    except Exception as e:
        print("\n" + "=" * 60)
        print(f"❌ ERRO NO SEED: {e}")
        print("=" * 60)
        session.rollback()
        raise
        
    finally:
        session.close()


if __name__ == "__main__":
    seed_database()