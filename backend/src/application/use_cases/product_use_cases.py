
from typing import Optional
from src.application.interfaces.repositories import IProductRepository
from src.application.dtos.product_dto import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse
)
from src.domain.entities.product import ProductEntity
from src.domain.exceptions.business_exceptions import ProductNotFoundException
import math


class ProductUseCases:
    """Casos de uso relacionados a produtos."""
    
    def __init__(self, product_repository: IProductRepository):
        """
        Inicializa os use cases.
        
        Args:
            product_repository: Repositório de produtos injetado
        """
        self.product_repository = product_repository
    
    def create_product(self, product_data: ProductCreate) -> ProductResponse:
        """
        Cria um novo produto.
        
        Args:
            product_data: Dados do produto a ser criado
        
        Returns:
            ProductResponse com dados do produto criado
        
        Raises:
            DuplicateSKUException: Se o SKU já existe
        """
        # Criar entity a partir do DTO
        product_entity = ProductEntity(
            id=None,
            name=product_data.name,
            sku=product_data.sku,
            price=product_data.price,
            stock_qty=product_data.stock_qty,
            is_active=product_data.is_active
        )
        
        # Validar regras de negócio
        product_entity.validate()
        
        # Persistir no banco
        created_product = self.product_repository.create(product_entity)
        
        # Retornar DTO de resposta
        return ProductResponse.model_validate(created_product)
    
    def get_product_by_id(self, product_id: int) -> ProductResponse:
        """
        Busca um produto por ID.
        
        Args:
            product_id: ID do produto
        
        Returns:
            ProductResponse com dados do produto
        
        Raises:
            ProductNotFoundException: Se o produto não existe
        """
        product = self.product_repository.get_by_id(product_id)
        
        if not product:
            raise ProductNotFoundException(f"Produto com ID {product_id} não encontrado")
        
        return ProductResponse.model_validate(product)
    
    def list_products(
        self,
        page: int = 1,
        page_size: int = 20,
        is_active: Optional[bool] = None,
        name_filter: Optional[str] = None,
        sku_filter: Optional[str] = None,
        order_by: str = "created_at",
        order_direction: str = "desc"
    ) -> ProductListResponse:
        """
        Lista produtos com paginação e filtros.
        
        Args:
            page: Número da página (começando em 1)
            page_size: Tamanho da página
            is_active: Filtro por status ativo/inativo
            name_filter: Filtro parcial por nome
            sku_filter: Filtro parcial por SKU
            order_by: Campo para ordenação
            order_direction: Direção da ordenação (asc, desc)
        
        Returns:
            ProductListResponse com lista paginada
        """
        # Calcular skip
        skip = (page - 1) * page_size
        
        # Buscar produtos
        products, total = self.product_repository.list_all(
            skip=skip,
            limit=page_size,
            is_active=is_active,
            name_filter=name_filter,
            sku_filter=sku_filter,
            order_by=order_by,
            order_direction=order_direction
        )
        
        # Calcular total de páginas
        total_pages = math.ceil(total / page_size) if total > 0 else 0
        
        # Converter entities para DTOs
        items = [ProductResponse.model_validate(p) for p in products]
        
        return ProductListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    
    def update_product(self, product_id: int, product_data: ProductUpdate) -> ProductResponse:
        """
        Atualiza um produto existente.
        
        Args:
            product_id: ID do produto
            product_data: Dados para atualizar
        
        Returns:
            ProductResponse com dados atualizados
        
        Raises:
            ProductNotFoundException: Se o produto não existe
            DuplicateSKUException: Se o novo SKU já existe
        """
        # Buscar produto existente
        existing_product = self.product_repository.get_by_id(product_id)
        
        if not existing_product:
            raise ProductNotFoundException(f"Produto com ID {product_id} não encontrado")
        
        # Atualizar apenas campos fornecidos
        update_data = product_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(existing_product, field, value)
        
        # Validar regras de negócio
        existing_product.validate()
        
        # Persistir alterações
        updated_product = self.product_repository.update(existing_product)
        
        return ProductResponse.model_validate(updated_product)
    
    def delete_product(self, product_id: int) -> bool:
        """
        Deleta um produto (soft delete).
        
        Args:
            product_id: ID do produto
        
        Returns:
            True se deletado com sucesso
        
        Raises:
            ProductNotFoundException: Se o produto não existe
        """
        success = self.product_repository.delete(product_id)
        
        if not success:
            raise ProductNotFoundException(f"Produto com ID {product_id} não encontrado")
        
        return success