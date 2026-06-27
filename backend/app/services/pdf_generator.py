from fpdf import FPDF
from datetime import datetime
import pandas as pd
from typing import List, Dict, Any

class SpendLensPDF(FPDF):
    def header(self):
        # Header banner
        self.set_font("helvetica", "B", 18)
        self.set_text_color(43, 108, 176)  # Accent blue
        self.cell(0, 10, "SpendLens Monthly Financial Report", border=False, align="L")
        self.ln(8)
        self.set_draw_color(43, 108, 176)
        self.set_line_width(0.8)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(8)
        
    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.set_text_color(160, 174, 192)  # Gray
        # Page number
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}} | SpendLens Personal Finance", align="C")

def generate_pdf_report(user_email: str, transactions_data: List[Dict[str, Any]], month_str: str) -> bytes:
    # 1. Process data using pandas
    df = pd.DataFrame(transactions_data)
    
    total_spent = 0.0
    total_income = 0.0
    net_savings = 0.0
    top_categories = []
    anomalies = []
    
    if not df.empty:
        # Separate incomes and expenses
        df_expenses = df[df["amount"] < 0].copy()
        df_income = df[df["amount"] > 0].copy()
        
        total_spent = float(df_expenses["amount"].abs().sum())
        total_income = float(df_income["amount"].sum())
        net_savings = total_income - total_spent
        
        # Top spending categories
        if not df_expenses.empty:
            df_expenses["abs_amount"] = df_expenses["amount"].abs()
            cat_sums = df_expenses.groupby("category")["abs_amount"].sum().reset_index()
            cat_sums = cat_sums.rename(columns={"abs_amount": "amount"})
            cat_sums = cat_sums.sort_values(by="amount", ascending=False)
            top_categories = cat_sums.head(3).to_dict(orient="records")
            
        # Anomalies for this specific month
        anomalies = df[df["is_anomaly"] == True].to_dict(orient="records")

    # 2. PDF Setup
    pdf = SpendLensPDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    
    # Metadata Title Card
    pdf.set_font("helvetica", "B", 12)
    pdf.set_text_color(45, 55, 72) # Dark text
    pdf.cell(50, 6, "Report Details", border=False)
    pdf.ln(5)
    
    pdf.set_font("helvetica", "", 10)
    pdf.cell(40, 6, f"User Account:", border=False)
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(0, 6, user_email, border=False)
    pdf.ln(5)
    
    pdf.set_font("helvetica", "", 10)
    pdf.cell(40, 6, f"Report Month:", border=False)
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(0, 6, month_str, border=False)
    pdf.ln(5)
    
    pdf.set_font("helvetica", "", 10)
    pdf.cell(40, 6, f"Generated On:", border=False)
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(0, 6, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), border=False)
    pdf.ln(12)
    
    # Section: Monthly Summary
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(43, 108, 176)
    pdf.cell(0, 8, "1. Monthly Cashflow Summary", border=False)
    pdf.ln(8)
    
    # Summary Grid Layout
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(45, 55, 72)
    pdf.set_fill_color(247, 250, 252) # Light gray bg
    
    pdf.cell(60, 8, " Metric", border=1, fill=True)
    pdf.cell(60, 8, " Amount", border=1, fill=True)
    pdf.ln(8)
    
    pdf.cell(60, 8, " Total Income", border=1)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(56, 161, 105) # Green
    pdf.cell(60, 8, f" +INR {total_income:,.2f}", border=1)
    pdf.ln(8)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(45, 55, 72)
    pdf.cell(60, 8, " Total Spent", border=1)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(229, 62, 62) # Red
    pdf.cell(60, 8, f" -INR {total_spent:,.2f}", border=1)
    pdf.ln(8)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(45, 55, 72)
    pdf.cell(60, 8, " Net Cashflow", border=1)
    pdf.set_font("helvetica", "B", 10)
    
    if net_savings >= 0:
        pdf.set_text_color(56, 161, 105) # Green
        pdf.cell(60, 8, f" +INR {net_savings:,.2f} (Saved)", border=1)
    else:
        pdf.set_text_color(229, 62, 62) # Red
        pdf.cell(60, 8, f" -INR {abs(net_savings):,.2f} (Overspent)", border=1)
    pdf.ln(12)
    
    # Section: Top Spending Categories
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(43, 108, 176)
    pdf.cell(0, 8, "2. Top Spending Categories", border=False)
    pdf.ln(8)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(45, 55, 72)
    
    if top_categories:
        pdf.cell(60, 8, " Category", border=1, fill=True)
        pdf.cell(60, 8, " Amount Spent", border=1, fill=True)
        pdf.cell(60, 8, " Percentage of Total", border=1, fill=True)
        pdf.ln(8)
        
        pdf.set_font("helvetica", "", 10)
        for cat in top_categories:
            cat_name = cat["category"]
            cat_amount = cat["amount"]
            cat_pct = (cat_amount / total_spent) * 100 if total_spent > 0 else 0
            
            pdf.cell(60, 8, f" {cat_name}", border=1)
            pdf.cell(60, 8, f" INR {cat_amount:,.2f}", border=1)
            pdf.cell(60, 8, f" {cat_pct:.1f}%", border=1)
            pdf.ln(8)
    else:
        pdf.set_font("helvetica", "I", 10)
        pdf.cell(0, 8, "No expense transactions recorded in this month.", border=False)
        pdf.ln(8)
        
    pdf.ln(4)
    
    # Section: Flagged Anomalies
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(43, 108, 176)
    pdf.cell(0, 8, "3. Flagged Spending Anomalies", border=False)
    pdf.ln(8)
    
    if anomalies:
        pdf.set_font("helvetica", "", 9)
        pdf.set_text_color(45, 55, 72)
        pdf.cell(20, 8, " Date", border=1, fill=True)
        pdf.cell(40, 8, " Description", border=1, fill=True)
        pdf.cell(30, 8, " Category", border=1, fill=True)
        pdf.cell(25, 8, " Amount", border=1, fill=True)
        pdf.cell(65, 8, " Anomaly Reason", border=1, fill=True)
        pdf.ln(8)
        
        for anom in anomalies:
            date_str = str(anom["date"])
            desc = str(anom["description"])[:20]
            cat_name = str(anom["category"])
            amount = abs(anom["amount"])
            reason = str(anom["anomaly_reason"]) if "anomaly_reason" in anom else "Exceeded average spending"
            
            pdf.cell(20, 8, f" {date_str}", border=1)
            pdf.cell(40, 8, f" {desc}", border=1)
            pdf.cell(30, 8, f" {cat_name}", border=1)
            pdf.set_text_color(229, 62, 62)
            pdf.cell(25, 8, f" -INR {amount:,.2f}", border=1)
            pdf.set_text_color(45, 55, 72)
            pdf.cell(65, 8, f" {reason}", border=1)
            pdf.ln(8)
    else:
        pdf.set_font("helvetica", "I", 10)
        pdf.set_text_color(56, 161, 105)
        pdf.cell(0, 8, "No spending anomalies detected this month. Keep up the good work!", border=False)
        pdf.ln(8)
        
    pdf.ln(4)
    pdf.set_text_color(45, 55, 72)
    
    # Section: AI Written Insights
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(43, 108, 176)
    pdf.cell(0, 8, "4. SpendLens AI Insight", border=False)
    pdf.ln(8)
    
    pdf.set_font("helvetica", "", 10)
    
    # Formulate computed insight
    if anomalies:
        largest_anomaly_cat = anomalies[0]["category"]
        insight_text = (
            f"Alert: Your spending on '{largest_anomaly_cat}' was significantly higher than usual this month. "
            f"We strongly recommend reviewing your subscriptions, transfers, or large expenditures under '{largest_anomaly_cat}' "
            f"to control future cash outflow."
        )
    elif net_savings < 0:
        largest_cat = top_categories[0]["category"] if top_categories else "None"
        insight_text = (
            f"Notice: You experienced negative net savings (overspent) this month. "
            f"To re-balance your budget, consider lowering your expenses in your largest category: '{largest_cat}'."
        )
    else:
        largest_cat = top_categories[0]["category"] if top_categories else "None"
        insight_text = (
            f"Insight: Excellent financial health! You maintained positive net savings. "
            f"Your highest spending category was '{largest_cat}'. "
            f"Consistent savings will help you meet your future investment goals."
        )
        
    # Multi-cell for word wrap
    pdf.set_fill_color(237, 242, 247)
    pdf.multi_cell(0, 7, f" {insight_text}", border=1, fill=True)
    
    # Return as bytes
    return pdf.output()
