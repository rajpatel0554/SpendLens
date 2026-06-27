from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
from datetime import datetime

from ..database import get_db
from ..models import User, Transaction
from ..schemas import AnalyticsSummary, CategorySpend, MonthlyTrend, TransactionOut
from ..auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch all user transactions from DB
    txs = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    
    # Default empty values
    default_summary = AnalyticsSummary(
        total_spent=0.0,
        largest_category="None",
        anomalies_flagged=0,
        savings_potential=0.0,
        category_progress=[],
        monthly_trends=[]
    )
    
    if not txs:
        return default_summary
        
    # Build DataFrame
    data = []
    anomalies_count = 0
    for t in txs:
        if t.is_anomaly:
            anomalies_count += 1
        data.append({
            "date": t.date,
            "category": t.category,
            "amount": t.amount,
            "is_anomaly": t.is_anomaly
        })
        
    df = pd.DataFrame(data)
    
    # Filter for expenses only (amount < 0) for spend analytics
    df_expenses = df[df["amount"] < 0].copy()
    
    if df_expenses.empty:
        return default_summary
        
    df_expenses["abs_amount"] = df_expenses["amount"].abs()
    
    # 1. Total Spent
    total_spent = float(df_expenses["abs_amount"].sum())
    
    # 2. Category Aggregations
    cat_summary = df_expenses.groupby("category")["abs_amount"].sum().reset_index()
    cat_summary = cat_summary.sort_values(by="abs_amount", ascending=False)
    
    largest_category = "None"
    if not cat_summary.empty:
        largest_category = str(cat_summary.iloc[0]["category"])
        
    category_progress = []
    for _, row in cat_summary.iterrows():
        cat_name = str(row["category"])
        cat_amount = float(row["abs_amount"])
        pct = (cat_amount / total_spent) * 100 if total_spent > 0 else 0.0
        category_progress.append(
            CategorySpend(
                category=cat_name,
                amount=round(cat_amount, 2),
                percentage=round(pct, 2)
            )
        )
        
    # 3. Monthly Trends
    df_expenses["month"] = pd.to_datetime(df_expenses["date"]).dt.strftime("%Y-%m")
    monthly_summary = df_expenses.groupby("month")["abs_amount"].sum().reset_index()
    monthly_summary = monthly_summary.sort_values(by="month")
    
    monthly_trends = []
    for _, row in monthly_summary.iterrows():
        monthly_trends.append(
            MonthlyTrend(
                month=str(row["month"]),
                amount=round(float(row["abs_amount"]), 2)
            )
        )
        
    # 4. Savings Potential (Sum of anomalous excess spends, or default to 15% of total spent)
    # Let's calculate the savings potential: if there are anomalies, find the excess spend
    anomalies_flagged = anomalies_count
    savings_potential = 0.0
    
    # Fetch actual anomaly reasons to calculate excess spend
    # The reason format is: "Category spend is Rx your 3-month average"
    # We can compute: excess = current_spend - (current_spend / R) = current_spend * (1 - 1/R)
    # Let's write a simple calculator:
    # If the user has anomalies, we can check their records
    anom_records = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.is_anomaly == True
    ).all()
    
    excess_sum = 0.0
    for ar in anom_records:
        if ar.anomaly_record:
            reason = ar.anomaly_record.reason
            # Match ratio inside reason text: "spend is X.Yx your 3-month average"
            match = re.search(r"spend is (\d+\.?\d*)x", reason)
            if match:
                ratio = float(match.group(1))
                if ratio > 1:
                    # Excess = transaction absolute amount * (1 - 1/ratio)
                    # (this is the portion that exceeds the average monthly spend)
                    abs_amt = abs(ar.amount)
                    excess_sum += abs_amt * (1.0 - (1.0 / ratio))
                    
    if excess_sum > 0:
        savings_potential = round(excess_sum, 2)
    else:
        # Default savings target is 15% of monthly average spend
        savings_potential = round(total_spent * 0.15, 2)
        
    return AnalyticsSummary(
        total_spent=round(total_spent, 2),
        largest_category=largest_category,
        anomalies_flagged=anomalies_flagged,
        savings_potential=round(savings_potential, 2),
        category_progress=category_progress,
        monthly_trends=monthly_trends
    )

@router.get("/anomalies", response_model=List[TransactionOut])
def get_anomalies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    anomalies = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.is_anomaly == True
    ).order_by(Transaction.date.desc()).all()
    
    return anomalies
import re # Make sure re is imported
