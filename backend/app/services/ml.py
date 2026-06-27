import os
import re
import pickle
import pandas as pd
from typing import List, Tuple, Dict, Any

class MLService:
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.is_loaded = False
        self._load_models()

    def _load_models(self):
        # Base dir is backend/
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        # Look for serialized files under ML_spendlens/models/
        workspace_dir = os.path.dirname(base_dir)
        model_path = os.path.join(workspace_dir, "ML_spendlens", "models", "model.pkl")
        vect_path = os.path.join(workspace_dir, "ML_spendlens", "models", "vectorizer.pkl")
        
        if not os.path.exists(model_path):
            # Fallback path inside backend if copied
            model_path = os.path.join(base_dir, "models", "model.pkl")
            vect_path = os.path.join(base_dir, "models", "vectorizer.pkl")

        try:
            if os.path.exists(model_path) and os.path.exists(vect_path):
                with open(model_path, "rb") as f:
                    self.model = pickle.load(f)
                with open(vect_path, "rb") as f:
                    self.vectorizer = pickle.load(f)
                self.is_loaded = True
                print("ML models loaded successfully from:", model_path)
            else:
                print("WARNING: ML model/vectorizer files not found. Using rule-based fallback.")
        except Exception as e:
            print(f"ERROR preloading ML models: {e}. Using rule-based fallback.")

    def clean_text(self, text: str) -> str:
        # Preprocessing matching the model training script train_model.py line 20
        text = str(text).lower()
        text = re.sub(r'[^a-z0-9\s]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def rule_based_predict(self, desc: str) -> str:
        desc_upper = desc.upper()
        if "CASHDEP" in desc_upper:
            return "Cash Deposit"
        elif "IMPS" in desc_upper:
            return "IMPS Transfer"
        elif "NEFT" in desc_upper:
            return "NEFT Transfer"
        elif "RTGS" in desc_upper:
            return "RTGS Transfer"
        elif "TRF" in desc_upper or "INTERNAL FUND" in desc_upper:
            return "Fund Transfer"
        elif "AEPS" in desc_upper:
            return "AEPS Transaction"
        elif "CHQ" in desc_upper:
            return "Cheque"
        elif "IRCTC" in desc_upper:
            return "Railway"
        elif "NAAPTOL" in desc_upper or "AMAZON" in desc_upper or "FLIPKART" in desc_upper:
            return "Shopping"
        elif "BBPS" in desc_upper or "BILL" in desc_upper:
            return "Bill Payment"
        elif "NFS" in desc_upper or "ATM" in desc_upper:
            return "ATM"
        elif "RUP" in desc_upper:
            return "RuPay"
        elif "FDRL" in desc_upper:
            return "Bank Transfer"
        else:
            return "Others"

    def predict_categories(self, descriptions: List[str]) -> List[str]:
        if not descriptions:
            return []
            
        if self.is_loaded:
            try:
                cleaned = [self.clean_text(d) for d in descriptions]
                features = self.vectorizer.transform(cleaned)
                predictions = self.model.predict(features)
                return list(predictions)
            except Exception as e:
                print(f"ML prediction error: {e}. Falling back to rules.")
                
        return [self.rule_based_predict(d) for d in descriptions]

    def detect_anomalies(self, transactions: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], pd.DataFrame]:
        """
        Integrates the official anomaly detection logic on transaction history.
        Flags category-months where spending is >2x the 3-month average.
        Returns a list of flagged category anomalies and the full monthly analysis.
        """
        if not transactions:
            return [], pd.DataFrame()
            
        # Create DataFrame from transactions
        df = pd.DataFrame(transactions)
        
        # Standardize dates
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df = df.dropna(subset=["date"])
        
        # Filter for expenses only (amount < 0) and convert to positive values for spend sum analysis
        df_spend = df[df["amount"] < 0].copy()
        if df_spend.empty:
            return [], pd.DataFrame()
            
        df_spend["amount"] = df_spend["amount"].abs()
        df_spend["month"] = df_spend["date"].dt.to_period("M")
        
        # Monthly summary
        monthly_spend = (
            df_spend.groupby(["category", "month"])
            .agg(
                current_spend=("amount", "sum"),
                transaction_count=("amount", "count")
            )
            .reset_index()
            .sort_values(["category", "month"])
        )
        
        anomalies = []
        monthly_analysis = []
        
        for category in monthly_spend["category"].unique():
            category_data = monthly_spend[monthly_spend["category"] == category].copy()
            category_data = category_data.sort_values("month")
            
            # Require at least 4 months of history for a rolling 3-month comparison
            if len(category_data) < 4:
                continue
                
            for i in range(3, len(category_data)):
                current_month = category_data.iloc[i]
                previous_3_months = category_data.iloc[i-3:i]
                
                avg_spend = previous_3_months["current_spend"].mean()
                current_spend = current_month["current_spend"]
                
                if avg_spend <= 0:
                    continue
                    
                ratio = round(current_spend / avg_spend, 2)
                status = "ANOMALY" if ratio > 2 else "NORMAL"
                
                row = {
                    "category": category,
                    "month": str(current_month["month"]),
                    "current_spend": round(current_spend, 2),
                    "avg_last_3_months": round(avg_spend, 2),
                    "transaction_count": int(current_month["transaction_count"]),
                    "ratio": ratio,
                    "status": status
                }
                
                monthly_analysis.append(row)
                
                if ratio > 2:
                    anomaly_row = row.copy()
                    anomaly_row["reason"] = f"{category} spend is {ratio}x your 3-month average"
                    anomalies.append(anomaly_row)
                    
        analysis_df = pd.DataFrame(monthly_analysis)
        return anomalies, analysis_df

# Instantiate singleton service
ml_service = MLService()
