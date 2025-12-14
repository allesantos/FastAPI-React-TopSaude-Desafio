# customer_repository.py

"""
Implementação concreta do repositório de clientes.
Responsável por todas as operações de banco de dados relacionadas a clientes.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.application.interfaces.repositories import ICustomerRepository
from src.domain.entities.customer import CustomerEntity
from src.infrastructure.database.models import Customer
from src.domain.exceptions.business_exceptions import (
    CustomerNotFoundException,
    DuplicateEmailException,
    DuplicateDocumentException
)


class CustomerRepository(ICustomerRepository):
    """Implementação do repositório de clientes usando SQLAlchemy."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, customer: CustomerEntity) -> CustomerEntity:
        # Verificar duplicidade de email ou documento
        if self.db.query(Customer).filter(Customer.email == customer.email).first():
            raise DuplicateEmailException(f"Email '{customer.email}' já existe")
        if self.db.query(Customer).filter(Customer.document == customer.document).first():
            raise DuplicateDocumentException(f"Documento '{customer.document}' já existe")
        
        db_customer = Customer(
            name=customer.name,
            email=customer.email,
            document=CustomerEntity.format_document(customer.document)
        )
        self.db.add(db_customer)
        self.db.commit()
        self.db.refresh(db_customer)
        return self._to_entity(db_customer)
    
    def get_by_id(self, customer_id: int) -> Optional[CustomerEntity]:
        db_customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
        if not db_customer:
            return None
        return self._to_entity(db_customer)
    
    def get_by_email(self, email: str) -> Optional[CustomerEntity]:
        db_customer = self.db.query(Customer).filter(Customer.email == email).first()
        if not db_customer:
            return None
        return self._to_entity(db_customer)
    
    def get_by_document(self, document: str) -> Optional[CustomerEntity]:
        doc = CustomerEntity.format_document(document)
        db_customer = self.db.query(Customer).filter(Customer.document == doc).first()
        if not db_customer:
            return None
        return self._to_entity(db_customer)
    
    def list_all(
        self, 
        skip: int = 0, 
        limit: int = 20,
        # ✅ NOVOS PARÂMETROS DE FILTRO ADICIONADOS:
        name: Optional[str] = None,
        email: Optional[str] = None,
        document: Optional[str] = None
    ) -> tuple[List[CustomerEntity], int]:
        
        query = self.db.query(Customer)
        
        # ⚠️ APLICAÇÃO DO FILTROS USANDO iLIKE (busca case-insensitive)
        if name:
            query = query.filter(Customer.name.ilike(f"%{name}%"))
        
        if email:
            query = query.filter(Customer.email.ilike(f"%{email}%"))
        
        if document:
            cleaned_document = CustomerEntity.format_document(document)
            query = query.filter(Customer.document.ilike(f"%{cleaned_document}%"))
            print(f"🔍 DEBUG - Document recebido: '{document}'")
            print(f"🔍 DEBUG - Document limpo: '{cleaned_document}'")
            print(f"🔍 DEBUG - Total antes de filtrar: {self.db.query(Customer).count()}")
        
        total = query.count()
        db_customers = query.offset(skip).limit(limit).all()
        
        customers = [self._to_entity(c) for c in db_customers]
        return customers, total


    # -------------------------------------------------------------
    # ✅ MÉTODO FALTANTE — IMPLEMENTAÇÃO DO update()
    # -------------------------------------------------------------
    def update(self, customer: CustomerEntity) -> CustomerEntity:
        db_customer = self.db.query(Customer).filter(Customer.id == customer.id).first()
        if not db_customer:
            raise CustomerNotFoundException(f"Cliente ID {customer.id} não encontrado")

        # Verificar duplicidade de email se mudou
        if customer.email != db_customer.email:
            exists_email = (
                self.db.query(Customer)
                .filter(Customer.email == customer.email, Customer.id != customer.id)
                .first()
            )
            if exists_email:
                raise DuplicateEmailException(f"Email '{customer.email}' já existe")

        # Verificar duplicidade de documento se mudou
        new_document = CustomerEntity.format_document(customer.document)
        if new_document != db_customer.document:
            exists_document = (
                self.db.query(Customer)
                .filter(Customer.document == new_document, Customer.id != customer.id)
                .first()
            )
            if exists_document:
                raise DuplicateDocumentException(f"Documento '{customer.document}' já existe")

        # Atualizar campos
        db_customer.name = customer.name
        db_customer.email = customer.email
        db_customer.document = new_document

        self.db.commit()
        self.db.refresh(db_customer)
        return self._to_entity(db_customer)


    def delete(self, customer_id: int) -> bool:
        db_customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
        if not db_customer:
            return False
        self.db.delete(db_customer)
        self.db.commit()
        return True
    
    def _to_entity(self, db_customer: Customer) -> CustomerEntity:
        return CustomerEntity(
            id=db_customer.id,
            name=db_customer.name,
            email=db_customer.email,
            document=db_customer.document,
            created_at=db_customer.created_at,
            updated_at=db_customer.updated_at
        )
