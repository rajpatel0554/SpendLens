import sys
import os

# Append current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine, SessionLocal
from app.models import Category

# Core categories identified from the ML model dataset
CATEGORIES = [
    "Cash Deposit",
    "IMPS Transfer",
    "NEFT Transfer",
    "RTGS Transfer",
    "Fund Transfer",
    "AEPS Transaction",
    "Cheque",
    "Railway",
    "Shopping",
    "Bill Payment",
    "ATM",
    "RuPay",
    "Bank Transfer",
    "Others"
]

def seed_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Seeding transaction categories...")
        for cat_name in CATEGORIES:
            # Check if category exists
            existing = db.query(Category).filter(Category.name == cat_name).first()
            if not existing:
                cat = Category(name=cat_name)
                db.add(cat)
                print(f"Added category: {cat_name}")
            else:
                print(f"Category already exists: {cat_name}")
        db.commit()
        print("Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
