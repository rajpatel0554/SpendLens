from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict

# --- User Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Anomaly Schemas ---
class AnomalyOut(BaseModel):
    id: int
    transaction_id: int
    reason: str
    flagged_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Transaction Schemas ---
class TransactionCreate(BaseModel):
    date: date
    description: str
    amount: float
    category: str

class TransactionOut(BaseModel):
    id: int
    user_id: int
    date: date
    description: str
    amount: float
    category: str
    is_anomaly: bool
    anomaly_reason: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def model_validate(cls, obj, **kwargs):
        # Handle fetching reason from relationship
        instance = super().model_validate(obj, **kwargs)
        if obj.anomaly_record:
            instance.anomaly_reason = obj.anomaly_record.reason
        return instance

# --- Analytics Schemas ---
class CategorySpend(BaseModel):
    category: str
    amount: float
    percentage: float

class MonthlyTrend(BaseModel):
    month: str
    amount: float

class AnalyticsSummary(BaseModel):
    total_spent: float
    largest_category: str
    anomalies_flagged: int
    savings_potential: float
    category_progress: List[CategorySpend]
    monthly_trends: List[MonthlyTrend]
