"""
Implementação concreta do repositório de produtos.
Responsável por todas as operações de banco de dados relacionadas a produtos.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.application.interfaces.repositories import IProductRepository
from src.domain.entities.product import ProductEntity
from src.infrastructure.database.models import Product
from src.domain.exceptions.business_exceptions import (
    ProductNotFoundException,
    DuplicateSKUException
)


class ProductRepository(IProductRepository):
    """Implementação do repositório de produtos usando SQLAlchemy."""
    
    def __init__(self, db: Session):
        """
        Inicializa o repositório.
        
        Args:
            db: Sessão do banco de dados injetada
        """
        self.db = db
    
    def create(self, product: ProductEntity) -> ProductEntity:
        """
        Cria um novo produto no banco de dados.
        
        Args:
            product: Entidade do produto a ser criada
        
        Returns:
            ProductEntity com ID gerado
        
        Raises:
            DuplicateSKUException: Se o SKU já existe
        """
        # Verificar se SKU já existe
        existing = self.db.query(Product).filter(Product.sku == product.sku).first()
        if existing:
            raise DuplicateSKUException(f"SKU '{product.sku}' já existe")
        
        # Criar model do ORM
        db_product = Product(
            name=product.name,
            sku=product.sku,
            price=product.price,
            stock_qty=product.stock_qty,
            is_active=product.is_active
        )
        
        # Salvar no banco
        self.db.add(db_product)
        self.db.commit()
        self.db.refresh(db_product)
        
        # Converter de volta para entity
        return self._to_entity(db_product)
    
    def get_by_id(self, product_id: int) -> Optional[ProductEntity]:
        """
        Busca produto por ID.
        
        Args:
            product_id: ID do produto
        
        Returns:
            ProductEntity se encontrado, None caso contrário
        """
        db_product = self.db.query(Product).filter(Product.id == product_id).first()
        
        if not db_product:
            return None
        
        return self._to_entity(db_product)
    
    def get_by_sku(self, sku: str) -> Optional[ProductEntity]:
        """
        Busca produto por SKU.
        
        Args:
            sku: SKU do produto
        
        Returns:
            ProductEntity se encontrado, None caso contrário
        """
        db_product = self.db.query(Product).filter(Product.sku == sku).first()
        
        if not db_product:
            return None
        
        return self._to_entity(db_product)
    
    def list_all(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        is_active: Optional[bool] = None,
        name_filter: Optional[str] = None,
        sku_filter: Optional[str] = None,
        order_by: str = "created_at",
        order_direction: str = "desc"
    ) -> tuple[List[ProductEntity], int]:
        """
        Lista produtos com paginação e filtros.
        
        Args:
            skip: Número de registros a pular
            limit: Número máximo de registros a retornar
            is_active: Filtro por status ativo/inativo (None = todos)
            name_filter: Filtro parcial por nome
            sku_filter: Filtro parcial por SKU
            order_by: Campo para ordenação (created_at, name, price, stock_qty)
            order_direction: Direção da ordenação (asc, desc)
        
        Returns:
            Tupla (lista de produtos, total de registros)
        """
        # Query base
        query = self.db.query(Product)
        
        # Aplicar filtros
        if is_active is not None:
            query = query.filter(Product.is_active == is_active)
        
        if name_filter:
            query = query.filter(Product.name.ilike(f"%{name_filter}%"))
        
        if sku_filter:
            query = query.filter(Product.sku.ilike(f"%{sku_filter}%"))
        
        # Contar total antes de paginar
        total = query.count()
        
        # Aplicar ordenação
        order_column = getattr(Product, order_by, Product.created_at)
        if order_direction.lower() == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())
        
        # Aplicar paginação
        db_products = query.offset(skip).limit(limit).all()
        
        # Converter para entities
        products = [self._to_entity(p) for p in db_products]
        
        return products, total
    
    def update(self, product: ProductEntity) -> ProductEntity:
        """
        Atualiza um produto existente.
        
        Args:
            product: Entidade do produto com dados atualizados
        
        Returns:
            ProductEntity atualizado
        
        Raises:
            ProductNotFoundException: Se o produto não existe
            DuplicateSKUException: Se o novo SKU já existe em outro produto
        """
        # Buscar produto existente
        db_product = self.db.query(Product).filter(Product.id == product.id).first()
        
        if not db_product:
            raise ProductNotFoundException(f"Produto com ID {product.id} não encontrado")
        
        # Verificar se o novo SKU já existe em outro produto
        if product.sku != db_product.sku:
            existing = self.db.query(Product).filter(
                Product.sku == product.sku,
                Product.id != product.id
            ).first()
            
            if existing:
                raise DuplicateSKUException(f"SKU '{product.sku}' já existe em outro produto")
        
        # Atualizar campos
        db_product.name = product.name
        db_product.sku = product.sku
        db_product.price = product.price
        db_product.stock_qty = product.stock_qty
        db_product.is_active = product.is_active
        
        # Salvar alterações
        self.db.flush()
      
        return self._to_entity(db_product)
    
    def delete(self, product_id: int) -> bool:
        """
        Deleta um produto (soft delete - apenas marca como inativo).
        
        Args:
            product_id: ID do produto
        
        Returns:
            True se deletado, False se não encontrado
        """
        db_product = self.db.query(Product).filter(Product.id == product_id).first()
        
        if not db_product:
            return False
        
        # Soft delete - apenas marca como inativo
        db_product.is_active = False
        self.db.commit()
        
        return True
    
    def _to_entity(self, db_product: Product) -> ProductEntity:
        """
        Converte um model do ORM para uma entity do domínio.
        
        Args:
            db_product: Model do SQLAlchemy
        
        Returns:
            ProductEntity
        """
        return ProductEntity(
            id=db_product.id,
            name=db_product.name,
            sku=db_product.sku,
            price=db_product.price,
            stock_qty=db_product.stock_qty,
            is_active=db_product.is_active,
            created_at=db_product.created_at,
            updated_at=db_product.updated_at
        )