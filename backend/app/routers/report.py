from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from datetime import datetime, date
import calendar

from ..database import get_db
from ..models import User, Transaction
from ..auth import get_current_user
from ..services.pdf_generator import generate_pdf_report

router = APIRouter(prefix="/api/report", tags=["Reports"])

def get_month_range(month_str: str):
    try:
        dt = datetime.strptime(month_str, "%Y-%m")
        year = dt.year
        month = dt.month
        last_day = calendar.monthrange(year, month)[1]
        return date(year, month, 1), date(year, month, last_day)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid month format. Please use YYYY-MM."
        )

@router.get("/monthly")
def download_monthly_report(
    month: str = Query(..., description="Month in YYYY-MM format"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Determine the date range for the requested month
    start_date, end_date = get_month_range(month)
    
    # Query database for matching transactions
    txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).all()
    
    if not txs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No transaction records found for the month {month}."
        )
        
    # Serialize to dictionary list for the PDF service
    txs_list = []
    for t in txs:
        txs_list.append({
            "date": t.date.strftime("%Y-%m-%d"),
            "description": t.description,
            "amount": t.amount,
            "category": t.category,
            "is_anomaly": t.is_anomaly,
            "anomaly_reason": t.anomaly_record.reason if t.anomaly_record else None
        })
        
    # Compile PDF
    try:
        pdf_bytes = bytes(generate_pdf_report(current_user.email, txs_list, month))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile PDF report: {str(e)}"
        )
        
    # Return file download stream
    headers = {
        "Content-Disposition": f'attachment; filename="spendlens_report_{month}.pdf"'
    }
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
