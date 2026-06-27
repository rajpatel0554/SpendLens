import unittest
import os
import sys
import json
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database import Base, get_db
from app.models import Category, User, Transaction
from seed import CATEGORIES

# Test Database Configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_spendlens.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency override
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestSpendLensAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create database tables and seed categories
        Base.metadata.create_all(bind=engine)
        db = TestingSessionLocal()
        for cat_name in CATEGORIES:
            if not db.query(Category).filter(Category.name == cat_name).first():
                db.add(Category(name=cat_name))
        db.commit()
        db.close()
        
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        # Remove test database file
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        if os.path.exists("test_spendlens.db"):
            os.remove("test_spendlens.db")

    def test_01_health_check(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "running")

    def test_02_register_user(self):
        payload = {"email": "testuser@example.com", "password": "securepassword"}
        response = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["email"], "testuser@example.com")
        self.assertIn("id", response.json())

    def test_03_login_user(self):
        payload = {"username": "testuser@example.com", "password": "securepassword"}
        response = self.client.post("/api/auth/login", data=payload)
        self.assertEqual(response.status_code, 200)
        self.assertIn("access_token", response.json())
        self.assertEqual(response.json()["token_type"], "bearer")
        
        # Store token for subsequent requests
        self.__class__.token = response.json()["access_token"]
        self.__class__.auth_headers = {"Authorization": f"Bearer {self.token}"}

    def test_04_read_me(self):
        response = self.client.get("/api/auth/me", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["email"], "testuser@example.com")

    def test_05_manual_transaction(self):
        payload = {
            "date": "2026-06-25",
            "description": "Test Swiggy Order",
            "amount": -450.50,
            "category": "Shopping"
        }
        response = self.client.post("/api/transactions/manual", json=payload, headers=self.auth_headers)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["description"], "Test Swiggy Order")
        self.assertEqual(response.json()["amount"], -450.50)
        self.__class__.created_tx_id = response.json()["id"]

    def test_06_list_transactions(self):
        response = self.client.get("/api/transactions", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.json()) >= 1)
        self.assertEqual(response.json()[0]["description"], "Test Swiggy Order")

    def test_07_upload_json_statement(self):
        # Create a mock json transaction list
        mock_statement = [
            {"date": "2026-06-01", "description": "ATM CASH WDL", "amount": -2000.0},
            {"date": "2026-06-02", "description": "Salary Credit", "amount": 50000.0},
            {"date": "2026-06-03", "description": "Amazon Order", "amount": -1500.0}
        ]
        file_content = json.dumps(mock_statement).encode("utf-8")
        
        response = self.client.post(
            "/api/upload",
            files={"file": ("statement.json", file_content, "application/json")},
            headers=self.auth_headers
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(len(response.json()) >= 3)
        # Verify classification and amounts (original order)
        self.assertEqual(response.json()[2]["amount"], -1500.0)
        self.assertEqual(response.json()[2]["category"], "Shopping") # Amazon maps to Shopping

    def test_08_get_analytics_summary(self):
        response = self.client.get("/api/analytics/summary", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        summary = response.json()
        self.assertIn("total_spent", summary)
        self.assertIn("largest_category", summary)
        self.assertIn("monthly_trends", summary)
        self.assertTrue(summary["total_spent"] > 0)

    def test_09_download_report(self):
        response = self.client.get("/api/report/monthly?month=2026-06", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "application/pdf")
        self.assertTrue(len(response.content) > 0)

    def test_10_delete_transaction(self):
        response = self.client.delete(f"/api/transactions/{self.created_tx_id}", headers=self.auth_headers)
        self.assertEqual(response.status_code, 204)
        
        # Verify it was deleted
        response_check = self.client.get("/api/transactions", headers=self.auth_headers)
        ids = [t["id"] for t in response_check.json()]
        self.assertNotIn(self.created_tx_id, ids)

if __name__ == "__main__":
    unittest.main()
