import pandas as pd
import pickle
import re
from sklearn.metrics import accuracy_score


# =====================================
# Load Model & Vectorizer
# =====================================

model = pickle.load(
    open("models/model.pkl", "rb")
)

vectorizer = pickle.load(
    open("models/vectorizer.pkl", "rb")
)


# =====================================
# Text Cleaning Function
# =====================================

def clean_text(text):

    text = str(text).lower()

    text = re.sub(
        r'[^a-z0-9\s]',
        '',
        text
    )

    text = re.sub(
        r'\s+',
        ' ',
        text
    ).strip()

    return text


# =====================================
# PART 1 : REAL DATASET TESTING
# =====================================

print("\n" + "=" * 70)
print("PART 1 : REAL DATASET VALIDATION")
print("=" * 70)

df = pd.read_csv(
    "data/bank_transactions_raw_1000.csv"
)

sample_df = df[
    ["description", "category"]
].sample(
    n=20,
    random_state=42
)

actual_labels = []
predicted_labels = []

for _, row in sample_df.iterrows():

    description = row["description"]

    actual = row["category"]

    cleaned_text = clean_text(
        description
    )

    X = vectorizer.transform(
        [cleaned_text]
    )

    predicted = model.predict(X)[0]

    actual_labels.append(
        actual
    )

    predicted_labels.append(
        predicted
    )

    status = (
        "✓"
        if actual == predicted
        else "✗"
    )

    print(f"\n{status} {description}")

    print(
        f"Actual    : {actual}"
    )

    print(
        f"Predicted : {predicted}"
    )

real_accuracy = accuracy_score(
    actual_labels,
    predicted_labels
)

print("\n" + "-" * 70)

print(
    f"Real Dataset Accuracy : "
    f"{real_accuracy * 100:.2f}%"
)

print("-" * 70)


# =====================================
# PART 2 : UNSEEN TRANSACTION TESTING
# =====================================

print("\n" + "=" * 70)
print("PART 2 : UNSEEN TRANSACTION TESTING")
print("=" * 70)

unseen_transactions = [

    "SWIGGY ORD 98765",
    "ZOMATO PAYMENT 12345",

    "UBER TRIP 77889",
    "OLA CAB PAYMENT",

    "NETFLIX SUBSCRIPTION",
    "MOVIE TICKET BOOKING",

    "AMAZON PURCHASE",
    "MYNTRA ORDER 45678",

    "LIC PREMIUM PAYMENT",
    "INSURANCE PREMIUM",

    "SALARY CREDIT",
    "PAYROLL TRANSFER",

    "MUTUAL FUND SIP",
    "STOCK INVESTMENT",

    "HOSPITAL FEE",
    "MEDICAL CONSULTATION",

    "ELECTRICITY BILL",
    "MOBILE RECHARGE"
]

cleaned_transactions = [

    clean_text(text)

    for text in unseen_transactions

]

X_new = vectorizer.transform(
    cleaned_transactions
)

predictions = model.predict(
    X_new
)

print()

for text, pred in zip(
    unseen_transactions,
    predictions
):

    print(
        f"{text:<35} --> {pred}"
    )


# =====================================
# FINAL SUMMARY
# =====================================

print("\n" + "=" * 70)
print("FINAL TEST SUMMARY")
print("=" * 70)

print(
    f"Real Dataset Accuracy : "
    f"{real_accuracy * 100:.2f}%"
)

print(
    f"Total Sample Records Tested : "
    f"{len(sample_df)}"
)

print(
    f"Total Unseen Transactions Tested : "
    f"{len(unseen_transactions)}"
)

print("\nModel Testing Completed Successfully")

print("=" * 70)