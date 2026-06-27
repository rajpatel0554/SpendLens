from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import pandas as pd
import json

from ..database import get_db
from ..models import User, Transaction, Anomaly
from ..schemas import TransactionOut
from ..auth import get_current_user
from ..services.parser import parse_csv, parse_pdf, parse_json
from ..services.ml import ml_service

router = APIRouter(prefix="/api/upload", tags=["Upload"])

@router.post("", response_model=List[TransactionOut], status_code=status.HTTP_201_CREATED)
async def upload_statement(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Read file content
    contents = await file.read()
    filename = file.filename.lower()
    
    # Select appropriate parser
    try:
        if filename.endswith(".csv"):
            df = parse_csv(contents)
        elif filename.endswith(".pdf"):
            df = parse_pdf(contents)
        elif filename.endswith(".json"):
            df = parse_json(contents)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format. Please upload CSV, PDF, or JSON."
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error parsing statement: {str(e)}"
        )
        
    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Statement contains no valid transaction data."
        )

    # 1. Run ML Auto-Categorization
    descriptions = df["description"].tolist()
    predicted_categories = ml_service.predict_categories(descriptions)
    df["category"] = predicted_categories
    df["is_anomaly"] = False
    
    # Convert DataFrame back to transaction dict list
    new_txs = df.to_dict(orient="records")

    # 2. Run Anomaly Detection (Combine with existing DB transactions for context)
    existing_txs_db = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    existing_txs = [
        {
            "date": t.date.strftime("%Y-%m-%d"),
            "category": t.category,
            "amount": t.amount
        } for t in existing_txs_db
    ]
    
    # Run anomaly detector on combined history
    all_txs_for_eval = existing_txs + new_txs
    flagged_anomalies_list, _ = ml_service.detect_anomalies(all_txs_for_eval)
    
    # Build a lookup set/dict of anomalous category-months
    # Key format: (category, month_str) -> reason
    anomalous_lookup = {}
    for entry in flagged_anomalies_list:
        anomalous_lookup[(entry["category"], entry["month"])] = entry["reason"]

    # 3. Create Transaction models and save
    saved_transactions = []
    
    for tx_data in new_txs:
        # Determine if this transaction falls into an anomalous category-month
        tx_date_obj = datetime.strptime(tx_data["date"], "%Y-%m-%d").date()
        tx_month_str = tx_date_obj.strftime("%Y-%m")
        tx_category = tx_data["category"]
        
        is_anomaly = False
        reason = None
        
        # Check lookup. Anomaly detection is only triggered for negative transactions (spends)
        if tx_data["amount"] < 0 and (tx_category, tx_month_str) in anomalous_lookup:
            is_anomaly = True
            reason = anomalous_lookup[(tx_category, tx_month_str)]
            
        transaction = Transaction(
            user_id=current_user.id,
            date=tx_date_obj,
            description=tx_data["description"],
            amount=tx_data["amount"],
            category=tx_category,
            is_anomaly=is_anomaly
        )
        db.add(transaction)
        db.flush() # Populate the ID
        
        if is_anomaly and reason:
            anomaly_record = Anomaly(
                transaction_id=transaction.id,
                reason=reason,
                flagged_at=datetime.utcnow()
            )
            db.add(anomaly_record)
            
        saved_transactions.append(transaction)
        
    db.commit()
    
    # Refresh to load relationships
    for t in saved_transactions:
        db.refresh(t)
        
    return saved_transactions
