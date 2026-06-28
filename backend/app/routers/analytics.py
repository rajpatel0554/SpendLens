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
    year: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch all user transactions from DB
    txs = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    
    # Build DataFrame to find available years first
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
    
    available_years = []
    if not df.empty:
        available_years = sorted(list(df["date"].apply(lambda d: d[:4]).unique()), reverse=True)
    
    # Default empty values
    default_summary = AnalyticsSummary(
        total_spent=0.0,
        largest_category="None",
        anomalies_flagged=0,
        savings_potential=0.0,
        category_progress=[],
        monthly_trends=[],
        total_income=0.0,
        net_savings=0.0,
        savings_rate=0.0,
        recent_transactions=[],
        available_years=available_years
    )
    
    if not txs:
        return default_summary
    
    # Filter by year if specified, otherwise default to the most recent year
    selected_year = year
    if not selected_year:
        selected_year = available_years[0] if available_years else "all"
        
    if selected_year != "all":
        df_filtered = df[df["date"].str.startswith(selected_year)].copy()
    else:
        df_filtered = df.copy()
    
    # Calculate total income (amount > 0)
    df_income = df_filtered[df_filtered["amount"] > 0]
    total_income = float(df_income["amount"].sum()) if not df_income.empty else 0.0
    
    # Filter for expenses only (amount < 0) for spend analytics
    df_expenses = df_filtered[df_filtered["amount"] < 0].copy()
    
    if df_expenses.empty:
        recent_txs = db.query(Transaction).filter(
            Transaction.user_id == current_user.id
        ).order_by(Transaction.date.desc()).limit(5).all()
        return AnalyticsSummary(
            total_spent=0.0,
            largest_category="None",
            anomalies_flagged=0,
            savings_potential=0.0,
            category_progress=[],
            monthly_trends=[],
            total_income=round(total_income, 2),
            net_savings=round(total_income, 2),
            savings_rate=100.0 if total_income > 0 else 0.0,
            recent_transactions=recent_txs,
            available_years=available_years
        )
        
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
        
    # 3. Monthly Trends (Income vs Expenses)
    df_filtered["month"] = pd.to_datetime(df_filtered["date"]).dt.strftime("%Y-%m")
    
    monthly_trends = []
    if not df_filtered.empty:
        months = sorted(df_filtered["month"].unique())
        if selected_year == "all":
            months = months[-12:]  # Limit to last 12 months for "all" view
        for m in months:
            df_m = df_filtered[df_filtered["month"] == m]
            
            df_m_income = df_m[df_m["amount"] > 0]
            m_income = float(df_m_income["amount"].sum()) if not df_m_income.empty else 0.0
            
            df_m_expense = df_m[df_m["amount"] < 0]
            m_expense = float(df_m_expense["amount"].abs().sum()) if not df_m_expense.empty else 0.0
            
            monthly_trends.append(
                MonthlyTrend(
                    month=m,
                    income=round(m_income, 2),
                    expense=round(m_expense, 2)
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
        
    net_savings = total_income - total_spent
    savings_rate = (net_savings / total_income) * 100 if total_income > 0 else 0.0
    
    recent_txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.date.desc()).limit(5).all()
        
    return AnalyticsSummary(
        total_spent=round(total_spent, 2),
        largest_category=largest_category,
        anomalies_flagged=anomalies_flagged,
        savings_potential=round(savings_potential, 2),
        category_progress=category_progress,
        monthly_trends=monthly_trends,
        total_income=round(total_income, 2),
        net_savings=round(net_savings, 2),
        savings_rate=round(savings_rate, 2),
        recent_transactions=recent_txs,
        available_years=available_years
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
