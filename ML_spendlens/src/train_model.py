import pandas as pd
import re
import pickle

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# Load dataset
df = pd.read_csv(
    "data/bank_transactions_raw_1000.csv"
)

# Remove missing values
df = df.dropna(subset=["description", "category"])

# Text Cleaning
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

df["clean_description"] = df["description"].apply(clean_text)

# Features and Labels
X = df["clean_description"]
y = df["category"]

# TF-IDF
vectorizer = TfidfVectorizer(
    max_features=5000,
    ngram_range=(1, 2)
)

X = vectorizer.fit_transform(X)

# Train Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Naive Bayes
nb = MultinomialNB()
nb.fit(X_train, y_train)

pred_nb = nb.predict(X_test)

acc_nb = accuracy_score(
    y_test,
    pred_nb
)

print("\nNaive Bayes Accuracy:", round(acc_nb * 100, 2), "%")

# Random Forest
rf = RandomForestClassifier(
    n_estimators=300,
    random_state=42
)

rf.fit(X_train, y_train)

pred_rf = rf.predict(X_test)

acc_rf = accuracy_score(
    y_test,
    pred_rf
)

print("Random Forest Accuracy:", round(acc_rf * 100, 2), "%")

print("\nClassification Report:\n")

print(
    classification_report(
        y_test,
        pred_rf
    )
)

# Best Model
best_model = nb if acc_nb > acc_rf else rf

pickle.dump(
    best_model,
    open("models/model.pkl", "wb")
)

pickle.dump(
    vectorizer,
    open("models/vectorizer.pkl", "wb")
)

print("\nModel Saved Successfully")