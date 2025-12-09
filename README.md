# 🏥 TopSaúde Hub - Sistema de Catálogo e Pedidos

> Sistema full-stack completo para gerenciamento de catálogo de produtos e pedidos, desenvolvido com **Clean Architecture** e boas práticas de desenvolvimento.

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.12.10-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.12-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.2.1-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17.2-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias-utilizadas)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Screenshots do Sistema](#-screenshots-do-sistema)
- [Instalação e Execução](#-instalação-e-execução)
- [Testes](#-testes)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Decisões Técnicas](#-decisões-técnicas)
- [Diferenciais Implementados](#-diferenciais-implementados)

---

## 🎯 Sobre o Projeto

A **TopSaúde Hub** é um sistema completo de **catálogo de produtos e gerenciamento de pedidos** desenvolvido como desafio técnico. O projeto demonstra a aplicação de **Clean Architecture**, **SOLID**, **boas práticas de desenvolvimento** e **testes automatizados**.



### ✨ Destaques do Projeto

- 🏗️ **Clean Architecture** com separação clara de responsabilidades
- 🔒 **Idempotência** garantida via `Idempotency-Key` header (requisito obrigatório)
- ⚡ **Transações atômicas** com rollback automático (requisito obrigatório)
- 📦 **Controle de estoque** com validação antes de confirmar pedido (requisito obrigatório)
- 📊 **Logs estruturados** com Structlog (requisito obrigatório)
- 🧪 **91.5% de cobertura de testes** automatizados (requisito: mínimo 70%)
- 📋 **Envelope de resposta padrão** em todas as APIs (requisito obrigatório)
- 🎨 **Interface moderna** e responsiva com Tailwind CSS
- ♿ **Acessibilidade** implementada (semântica HTML, navegação por teclado, ARIA)
- 🐳 **Docker pronto para uso** com um único comando

---

## 🚀 Funcionalidades

### 🛍️ **Gestão de Produtos**
- ✅ Criar, listar, editar e deletar produtos
- ✅ Filtros por nome, SKU e status
- ✅ Ordenação customizável
- ✅ Paginação eficiente
- ✅ Validação de SKU único
- ✅ Controle de estoque automático

### 👥 **Gestão de Clientes**
- ✅ Cadastro completo de clientes
- ✅ Validação de email único
- ✅ Validação de documento (CPF/CNPJ)
- ✅ Formatação automática de documentos
- ✅ Filtros e busca por nome/email

### 📦 **Sistema de Pedidos**
- ✅ Criação de pedidos com múltiplos itens
- ✅ **Idempotência** via `Idempotency-Key` header (UUID v4) 
- ✅ Validação de estoque **antes** de confirmar pedido 
- ✅ Cálculo automático de totais (por item e total geral)
- ✅ **Transação atômica**: ou cria tudo ou não cria nada 
- ✅ Atualização de estoque automática
- ✅ **Status do pedido**: CREATED, PAID, CANCELLED 
- ✅ Histórico completo de pedidos
- ✅ Filtros por cliente e status
- ✅ Detalhes completos do pedido

---

## 🛠 Tecnologias Utilizadas

### **Backend**
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Python** | 3.12.10 | Linguagem principal |
| **FastAPI** | 0.115.12 | Framework web moderno e rápido |
| **SQLAlchemy** | 2.0.36 | ORM para PostgreSQL |
| **Alembic** | 1.14.0 | Migrations de banco de dados |
| **Pydantic** | 2.10.5 | Validação de dados |
| **Structlog** | 24.4.0 | Logs estruturados |
| **Pytest** | 8.3.4 | Framework de testes |
| **PostgreSQL** | 17.2 | Banco de dados relacional |

### **Frontend**
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **React** | 19.2.1 | Biblioteca UI |
| **TypeScript** | 5.x | Superset JavaScript tipado |
| **Vite** | 6.2.2 | Build tool moderna |
| **React Router** | 7.10.1 | Roteamento SPA |
| **Axios** | 1.13.2 | Cliente HTTP |
| **React Hook Form** | 7.68.0 | Gerenciamento de formulários |
| **Zod** | 4.1.13 | Validação de schemas |
| **TanStack Query** | 5.90.12 | Gerenciamento de estado assíncrono |
| **Tailwind CSS** | 3.4.18 | Framework CSS utilitário |
| **Lucide React** | 0.468.0 | Biblioteca de ícones |

### **Infraestrutura**
- 🐳 **Docker** + **Docker Compose** para containerização
- 🔧 **Nginx** para servir frontend em produção
- 📝 **Git** para controle de versão

---

## 🏗 Arquitetura

O projeto segue os princípios da **Clean Architecture**, garantindo:

- ✅ **Independência de frameworks**
- ✅ **Testabilidade** alta
- ✅ **Separação de responsabilidades**
- ✅ **Facilidade de manutenção**
- ✅ **Escalabilidade**

### 📐 Camadas do Backend

```
┌─────────────────────────────────────────┐
│         API Layer (FastAPI)             │  ← Rotas, Controllers, Middleware
├─────────────────────────────────────────┤
│      Application Layer (Use Cases)      │  ← Lógica de aplicação
├─────────────────────────────────────────┤
│       Domain Layer (Entities)           │  ← Regras de negócio puras
├─────────────────────────────────────────┤
│  Infrastructure Layer (Repositories)    │  ← Acesso a dados, DB
└─────────────────────────────────────────┘
```

### 🎨 Arquitetura do Frontend

- **Component-Based Architecture** com React
- **Custom Hooks** para lógica reutilizável
- **Context API** para estado global (Toast)
- **Service Layer** para comunicação com API
- **Type Safety** completo com TypeScript

---

## ✅ Pré-requisitos

Antes de começar, você precisa ter instalado:

- 🐍 **Python** 3.12.x ou superior
- 🟢 **Node.js** 18.x ou superior
- 📦 **npm** ou **yarn**
- 🐳 **Docker** e **Docker Compose** (recomendado)
- 💾 **PostgreSQL** 15+ (se não usar Docker)

---
## 📸 Screenshots do Sistema

<img src="https://github.com/allesantos/allesantos/blob/main/imagens/TopSaude-Desafio/01.png" width="700">

<img src="https://github.com/allesantos/allesantos/blob/main/imagens/TopSaude-Desafio/02.png" width="700">

<img src="https://github.com/allesantos/allesantos/blob/main/imagens/TopSaude-Desafio/03.png" width="700">

<img src="https://github.com/allesantos/allesantos/blob/main/imagens/TopSaude-Desafio/04.png" width="700">

<img src="https://github.com/allesantos/allesantos/blob/main/imagens/TopSaude-Desafio/05.png" width="700">

---

## 🚀 Instalação e Execução

### 🐳 **Opção 1: Docker (Recomendado)**

A forma mais rápida de rodar o projeto completo!

```bash
# 1. Clone o repositório
git clone https://github.com/allesantos/topsaude-desafio.git
cd topsaude-desafio

# 2. Configure as variáveis de ambiente
cp .env.example .env
cd frontend
cp .env.example .env
cd ..

# 3. Suba todos os containers
docker compose up -d

# 4. Aguarde os containers iniciarem (~30 segundos)

# 5. Execute as migrations
docker compose exec backend alembic upgrade head

# 6. (Opcional) Popule o banco com dados de teste
docker compose exec backend python scripts/seed_data.py
```

**Pronto! 🎉** Acesse:
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **API Backend**: http://localhost:8000
- 📚 **Documentação Swagger**: http://localhost:8000/docs

---

### 💻 **Opção 2: Desenvolvimento Local**

Se preferir rodar sem Docker:

#### **Backend**

```bash
cd backend

# 1. Crie e ative o ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
.\venv\Scripts\Activate.ps1  # Windows PowerShell

# 2. Instale as dependências
pip install -r requirements.txt

# 3. Configure o .env (ajuste DATABASE_URL se necessário)
cp ../.env.example ../.env

# 4. Execute as migrations
alembic upgrade head

# 5. (Opcional) Popule o banco
python scripts/seed_data.py

# 6. Inicie o servidor
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

#### **Frontend**

```bash
cd frontend

# 1. Instale as dependências
npm install

# 2. Configure o .env
cp .env.example .env

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

---

## 🧪 Testes

O projeto possui **91.5% de cobertura de testes** automatizados!

### 🔬 **Executar Testes Unitários**

```bash
cd backend
source venv/bin/activate  # ou .\venv\Scripts\Activate.ps1

# Executar todos os testes
pytest tests/ -v

# Executar testes com cobertura
pytest tests/ -v --cov=src --cov-report=html

# Ver relatório de cobertura no navegador
# Abra: backend/htmlcov/index.html
```

### 📊 **Cobertura Atual**

```
✅ 56 testes unitários automatizados
   - 35 testes de Entities
   - 12 testes de Use Cases (incluindo 3 críticos!)
   - 7 testes de Repository

📈 91.5% de cobertura (requisito: 70%)
✅ 100% dos testes passando
⚡ Tempo de execução: ~2.5 segundos
```

### 🔥 **Testes Críticos Implementados**

- ✅ **Idempotência (mesma chave)**: retorna o pedido existente sem duplicar
- ✅ **Idempotência (payload diferente)**: rejeita se payload divergir
- ✅ **Transação Atômica/Rollback**: erro reverte TUDO automaticamente
- ✅ **Controle de Estoque**: validação antes de confirmar pedido
- ✅ **Rollback Automático**: falhas não deixam dados inconsistentes

---

## 📁 Estrutura do Projeto

```
topsaude-desafio/
├── backend/
│   ├── src/
│   │   ├── domain/              # 🎯 Entities e regras de negócio
│   │   │   ├── entities/
│   │   │   │   ├── product.py
│   │   │   │   ├── customer.py
│   │   │   │   ├── order.py
│   │   │   │   └── order_item.py
│   │   │   └── exceptions/
│   │   ├── application/         # 💼 Use Cases e DTOs
│   │   │   ├── dtos/
│   │   │   ├── use_cases/
│   │   │   └── interfaces/
│   │   ├── infrastructure/      # 🔧 Repositórios e DB
│   │   │   ├── database/
│   │   │   ├── repositories/
│   │   │   └── logging/
│   │   ├── api/                 # 🌐 Rotas e Controllers
│   │   │   ├── routes/
│   │   │   ├── dependencies.py
│   │   │   ├── middleware.py
│   │   │   └── response_envelope.py  # ← Envelope padrão de resposta
│   │   ├── core/                # ⚙️ Configurações
│   │   │   ├── config.py
│   │   │   └── constants.py
│   │   └── main.py              # 🚀 Entry point
│   ├── tests/                   # 🧪 Testes automatizados
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── conftest.py          # ← Configurações do pytest
│   │   └── pytest.ini           # ← Configurações do pytest
│   ├── scripts/                 # 🛠️ Scripts úteis
│   │   ├── seed_data.py         # ← Popular banco com dados de teste
│   │   └── healthcheck.py       # ← Script de healthcheck
│   ├── alembic/                 # 📝 Migrations
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .gitignore               # ← Arquivos ignorados pelo Git
├── frontend/
│   ├── src/
│   │   ├── components/          # 🧩 Componentes React
│   │   │   ├── common/
│   │   │   ├── forms/
│   │   │   └── layout/
│   │   ├── pages/               # 📄 Páginas
│   │   │   ├── Products/
│   │   │   ├── Customers/
│   │   │   └── Orders/
│   │   ├── services/            # 🔌 Chamadas API
│   │   ├── hooks/               # 🪝 Custom Hooks
│   │   ├── contexts/            # 🌍 React Context
│   │   ├── types/               # 📐 TypeScript Types
│   │   └── constants/           # 📋 Constantes
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```
---

## 🔌 API Endpoints

### 🏥 **Health Check**
```
GET  /health       - Status da API
GET  /health/db    - Status do banco de dados
```

### 🛍️ **Produtos**
```
GET    /api/products           - Listar produtos (paginado)
GET    /api/products/{id}      - Buscar produto por ID
POST   /api/products           - Criar produto
PUT    /api/products/{id}      - Atualizar produto
DELETE /api/products/{id}      - Deletar produto (soft delete)
```

### 👥 **Clientes**
```
GET    /api/customers          - Listar clientes (paginado)
GET    /api/customers/{id}     - Buscar cliente por ID
POST   /api/customers          - Criar cliente
PUT    /api/customers/{id}     - Atualizar cliente
DELETE /api/customers/{id}     - Deletar cliente (soft delete)
```

### 📦 **Pedidos**
```
GET    /api/orders             - Listar pedidos (paginado)
GET    /api/orders/{id}        - Buscar pedido por ID
POST   /api/orders             - Criar pedido (requer Idempotency-Key header)
```

### 📋 **Envelope de Resposta Padrão**

Todas as respostas seguem o formato:

```json
{
  "cod_retorno": "SUCCESS",
  "mensagem": "Operação realizada com sucesso",
  "data": { /* dados aqui */ }
}
```

**Documentação interativa completa:** http://localhost:8000/docs

---

## 💡 Decisões Técnicas

### 🔒 **1. Idempotência**
- **Problema**: Evitar duplicação de pedidos em caso de retry
- **Solução**: Header obrigatório `Idempotency-Key` (UUID v4)
- **Resultado**: Mesma chave = mesmo pedido retornado, sem duplicação

### ⚡ **2. Transações Atômicas**
- **Problema**: Pedidos parcialmente criados em caso de erro
- **Solução**: Context manager `db.begin()` com rollback automático
- **Resultado**: Ou cria tudo (pedido + itens + atualiza estoque) ou não cria nada

### 📦 **3. Controle de Estoque**
- **Problema**: Vender mais do que há em estoque
- **Solução**: Validação de estoque **ANTES** de criar pedido
- **Resultado**: Impossível criar pedido com estoque insuficiente

### 📊 **4. Logs Estruturados**
- **Problema**: Logs difíceis de parsear e buscar
- **Solução**: Structlog com formato JSON
- **Resultado**: Logs fáceis de buscar, filtrar e integrar com ferramentas

### 🎨 **5. Clean Architecture**
- **Problema**: Código acoplado e difícil de testar
- **Solução**: Separação em camadas (Domain → Application → Infrastructure → API)
- **Resultado**: Alta testabilidade (91.5% cobertura) e manutenibilidade

### 🧪 **6. Testes Unitários com Mocks**
- **Problema**: Testes lentos dependendo do banco
- **Solução**: Mocks de repositories + factories de entities
- **Resultado**: 56 testes rodando em ~2.5 segundos

---

## ✨ Diferenciais Implementados

### 🏆 **Além dos Requisitos**

1. ✅ **Cobertura de 91.5%** (requisito era 70%)
2. ✅ **Testes críticos** de idempotência e transação
3. ✅ **Soft delete** em produtos e clientes
4. ✅ **Filtros e ordenação** customizáveis
5. ✅ **Logs estruturados** em JSON
6. ✅ **Middleware de logging** automático
7. ✅ **Envelope de resposta** padronizado
8. ✅ **Validações Pydantic** robustas
9. ✅ **TypeScript** no frontend (type safety)
10. ✅ **Custom Hooks** reutilizáveis
11. ✅ **Sistema de Toast** para feedback
12. ✅ **Loading states** em todas operações
13. ✅ **Tratamento de erros** global
14. ✅ **Componentes reutilizáveis** (Table, Input, Modal)
15. ✅ **Tailwind CSS** para estilização moderna

---

## 📦 Atendimento aos Requisitos do Desafio

### ✅ **Requisitos Backend *

| Requisito | Status | Evidência |
|-----------|--------|-----------|
| **Stack Python FastAPI + SQLAlchemy** | ✅ | `requirements.txt`, `src/main.py` |
| **CRUD de Produtos** | ✅ | `src/api/routes/products.py` + testes |
| **CRUD de Clientes** | ✅ | `src/api/routes/customers.py` + testes |
| **Criação de Pedidos c/ Transação Atômica** | ✅ | `src/application/use_cases/order_use_cases.py`  |
| **Validação de Estoque** | ✅ | Verificação antes de criar pedido  |
| **Idempotência via Header** | ✅ | `Idempotency-Key` obrigatório + testes críticos |
| **Envelope de Resposta Padrão** | ✅ | `src/api/response_envelope.py` |
| **Logs Estruturados** | ✅ | Structlog configurado + middleware |
| **Testes Unitários** | ✅ | 56 testes, 91.5% de cobertura |
| **SOLID + Clean Architecture** | ✅ | Separação Domain/Application/Infrastructure/API |
| **PostgreSQL** | ✅ | Configurado no Docker Compose |
| **Migrations** | ✅ | Alembic configurado |
| **Seed de Dados** | ✅ | 20 produtos + 10 clientes (`scripts/seed_data.py`) |

### ✅ **Requisitos Frontend **

| Requisito | Status | Evidência |
|-----------|--------|-----------|
| **Stack React 18+ TypeScript** | ✅ | React 19.2.1 + TypeScript |
| **Listagens com Paginação** | ✅ | Todas as telas de listagem |
| **Filtros e Ordenação** | ✅ | Implementado em produtos, clientes e pedidos |
| **Formulários com Validação** | ✅ | React Hook Form + Zod |
| **Tela de Criação de Pedidos** | ✅ | Autocomplete de produtos + validação de estoque |
| **Cálculo Automático de Totais** | ✅ | Line total e total geral |
| **Tratamento Global de Erros** | ✅ | Interceptor Axios + Toast Context |
| **Acessibilidade Básica** | ✅ | Semântica HTML, navegação por teclado, ARIA |
| **Tailwind CSS** | ✅ | Versão 3.4.18 configurada |

### ✅ **Requisitos de Infraestrutura **

| Requisito | Status | Evidência |
|-----------|--------|-----------|
| **Docker Backend** | ✅ | `backend/Dockerfile` |
| **Docker Frontend** | ✅ | `frontend/Dockerfile` + Nginx |
| **Docker Compose** | ✅ | `docker-compose.yml` completo |
| **.env.example** | ✅ | Raiz e frontend/ |
| **README.md** | ✅ | Este arquivo! |
| **Instruções de Execução** | ✅ | Seção "Instalação e Execução" |
| **Decisões Técnicas** | ✅ | Seção "Decisões Técnicas" |

### ✅ **Requisitos do Envelope **

```json
// ✅ Sucesso
{
  "cod_retorno": "SUCCESS",
  "mensagem": "Operação realizada com sucesso",
  "data": { /* dados aqui */ }
}

// ✅ Erro
{
  "cod_retorno": "ERROR",
  "mensagem": "Estoque insuficiente para o produto XYZ",
  "data": null
}
```

**Implementação:** `src/api/response_envelope.py`

### 🎯 **Status Geral: TODOS REQUISITOS ATENDIDOS! ✅**

---

## 🤖 Uso de IA no Desenvolvimento

Conforme orientação do desafio, utilizei **IA (Claude by Anthropic)** de forma estratégica durante o desenvolvimento. Abaixo, descrevo como essa ferramenta foi aplicada:

### 📊 **Onde a IA Foi Utilizada:**

#### **1. Arquitetura e Planejamento** 🏗️
- Validação da estrutura Clean Architecture proposta
- Revisão de padrões SOLID aplicados
- Discussão de trade-offs entre abordagens (ORM vs Query Builder, etc)

#### **2. Geração de Código Base** 💻
- Scaffolding inicial de entities, DTOs e repositories
- Templates padronizados de testes unitários
- Configurações iniciais de ferramentas (Alembic, Structlog, Docker)

#### **3. Otimização e Code Review** 🔍
- Identificação de code smells e sugestões de refatoração
- Revisão de implementações críticas (transações, idempotência)
- Sugestões de melhoria de performance

#### **4. Documentação** 📝
- Geração de comentários explicativos no código
- Estrutura deste README
- Documentação de decisões técnicas

### ✋ **Onde EU Fui Responsável:**

- ✅ **Decisões de Arquitetura**: Escolha de Clean Architecture, separação de camadas
- ✅ **Escolha de Stack**: Python 3.12 + FastAPI + PostgreSQL + React + Tailwind
- ✅ **Lógica de Negócio Crítica**: Implementação de idempotência, transações atômicas, controle de estoque
- ✅ **Estratégia de Testes**: Definição dos 56 testes unitários (91.5% cobertura)
- ✅ **Validações e Regras**: Todas as regras de negócio foram pensadas e validadas manualmente
- ✅ **Integração e Debugging**: Resolução de problemas, ajustes finos e testes E2E

### 🎯 **Metodologia de Trabalho:**

1. **Planejamento**: Defini a arquitetura e tecnologias baseado em experiência prévia
2. **Geração Assistida**: Usei IA para acelerar scaffolding e boilerplate
3. **Revisão Crítica**: Revisei, testei e compreendi cada linha gerada
4. **Validação**: Executei testes automatizados e manuais para garantir qualidade
5. **Refinamento**: Ajustei e otimizei baseado em resultados reais

### 💡 **Reflexão sobre o Uso de IA:**

A IA foi uma **ferramenta de produtividade**, não um substituto para conhecimento técnico. Ela acelerou tarefas repetitivas e permitiu focar em:
- Decisões de alto nível
- Lógica de negócio complexa
- Garantia de qualidade
- Experiência do usuário

**Resultado**: Entrega de projeto completo com 93% de cobertura de testes, arquitetura sólida e código de produção.

### 🔧 **Ferramentas Complementares:**

Além da IA, utilizei:
- **VS Code** com extensões de Python e TypeScript
- **Docker Desktop** para containerização
- **Postman** para testes manuais de API
- **Git** para controle de versão
- **Chrome DevTools** para debug do frontend

---

**Nota**: Todos os commits e decisões técnicas são de minha autoria. A IA foi uma assistente, não a autora do projeto.

---

## 📝 Comandos Úteis

### **Docker**
```bash
# Ver logs em tempo real
docker compose logs -f backend

# Reiniciar serviço específico
docker compose restart backend

# Executar comando no container
docker compose exec backend python scripts/seed_data.py

# Acessar bash do container
docker compose exec backend bash

# Parar tudo
docker compose down

# Parar e limpar volumes
docker compose down -v
```

### **Backend**
```bash
# Criar nova migration
alembic revision --autogenerate -m "Descrição"

# Aplicar migrations
alembic upgrade head

# Reverter última migration
alembic downgrade -1

# Executar testes
pytest tests/ -v

# Executar testes com cobertura
pytest tests/ -v --cov=src --cov-report=html
```

### **Frontend**
```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Verificar types TypeScript
npm run type-check
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto foi desenvolvido como **desafio técnico** para **TopSaúde Hub**.

**Desenvolvido por:** Alexandre Santos 
**Data de Conclusão:** 08/12/2025

---

## 👨‍💻 Autor

Desenvolvido com 💚 por **Alexandre Santos**

- GitHub: [@allesantos](https://github.com/allesantos)
- LinkedIn: [linkedin.com/in/alle-carlos-alexandre](https://www.linkedin.com/in/alle-carlos-alexandre/)
- Email: alledesenvolvimento@gmail.com

---

<div align="center">

**⭐ Se achou legal este projeto, considere dar uma estrela! ⭐**

</div>
