import pandas as pd
import re


def assign_category(desc):

    desc = str(desc).upper()

    if "CASHDEP" in desc:
        return "Cash Deposit"

    elif "IMPS" in desc:
        return "IMPS Transfer"

    elif "NEFT" in desc:
        return "NEFT Transfer"

    elif "RTGS" in desc:
        return "RTGS Transfer"

    elif "TRF" in desc:
        return "Fund Transfer"

    elif "INTERNAL FUND" in desc:
        return "Fund Transfer"

    elif "AEPS" in desc:
        return "AEPS Transaction"

    elif "CHQ" in desc:
        return "Cheque"

    elif "IRCTC" in desc:
        return "Railway"

    elif "NAAPTOL" in desc:
        return "Shopping"

    elif "BBPS" in desc:
        return "Bill Payment"

    elif "NFS" in desc:
        return "ATM"

    elif "RUP" in desc:
        return "RuPay"

    elif "FDRL" in desc:
        return "Bank Transfer"

    else:
        return "Others"


def clean_text(text):

    text = str(text).lower()

    text = re.sub(r'[^a-zA-Z\s]', ' ', text)

    text = re.sub(r'\s+', ' ', text)

    return text.strip()


df = pd.read_csv("data/bank_transactions_raw_1000.csv")

df["category"] = df["description"].apply(assign_category)

df["clean_description"] = (
    df["description"]
    .apply(clean_text)
)

df.to_csv(
    "data/categorized_transactions.csv",
    index=False
)

print("Dataset Processed Successfully")