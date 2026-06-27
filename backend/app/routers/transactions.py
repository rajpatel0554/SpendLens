from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ..database import get_db
from ..models import User, Transaction, Category
from ..schemas import TransactionCreate, TransactionOut
from ..auth import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.get("", response_model=List[TransactionOut])
def read_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    # Apply filters
    if category:
        query = query.filter(Transaction.category == category)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))
        
    # Sort by date descending, then id descending
    query = query.order_by(Transaction.date.desc(), Transaction.id.desc())
    
    # Paginate
    offset = (page - 1) * limit
    transactions = query.offset(offset).limit(limit).all()
    
    return transactions

@router.post("/manual", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_manual_transaction(
    tx_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate category exists
    cat_exists = db.query(Category).filter(Category.name == tx_in.category).first()
    if not cat_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{tx_in.category}' is invalid. Please select from seeded categories."
        )
        
    transaction = Transaction(
        user_id=current_user.id,
        date=tx_in.date,
        description=tx_in.description,
        amount=tx_in.amount,
        category=tx_in.category,
        is_anomaly=False
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction

@router.delete("/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    tx_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found."
        )
        
    db.delete(transaction)
    db.commit()
    return None
