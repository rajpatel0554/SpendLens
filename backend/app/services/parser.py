import io
import json
import pandas as pd
import pdfplumber
from datetime import datetime

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans and standardizes a pandas DataFrame containing bank transactions.
    Ensures columns are: date, description, amount (where expenses are negative).
    """
    # Normalize column names to lowercase
    df.columns = [str(col).strip().lower() for col in df.columns]
    
    # 1. Identify and map columns
    col_mapping = {}
    
    # Look for Date column
    date_candidates = ["date", "txn_date", "txn date", "transaction_date", "value_date", "value date"]
    for cand in date_candidates:
        if cand in df.columns:
            col_mapping[cand] = "date"
            break
            
    # Look for Description column
    desc_candidates = [
        "description", "narration", "particulars", "remarks", "details", 
        "txn_description", "transaction description", "transaction_description", "txn description"
    ]
    for cand in desc_candidates:
        if cand in df.columns:
            col_mapping[cand] = "description"
            break
            
    # Look for Amount/Debit/Credit columns
    amt_candidates = ["amount", "txn_amount", "transaction_amount", "val"]
    mapped_amt = False
    for cand in amt_candidates:
        if cand in df.columns:
            col_mapping[cand] = "amount"
            mapped_amt = True
            break
            
    # Apply partial mapping
    df = df.rename(columns=col_mapping)
    
    # Ensure date and description exist
    if "date" not in df.columns or "description" not in df.columns:
        raise ValueError("Missing critical columns: 'date' or 'description' could not be found.")
        
    # 2. Handle amounts (including Debit/Credit splits)
    if not mapped_amt:
        # Check if we have separate debit and credit columns
        debit_col = None
        credit_col = None
        for col in df.columns:
            if "debit" in col or "withdrawal" in col or "exp" in col:
                debit_col = col
            elif "credit" in col or "deposit" in col or "inc" in col:
                credit_col = col
                
        if debit_col and credit_col:
            # Reconstruct amount: credit - debit
            df[debit_col] = pd.to_numeric(df[debit_col].astype(str).str.replace(r'[^\d\.]', '', regex=True), errors="coerce").fillna(0)
            df[credit_col] = pd.to_numeric(df[credit_col].astype(str).str.replace(r'[^\d\.]', '', regex=True), errors="coerce").fillna(0)
            df["amount"] = df[credit_col] - df[debit_col]
        else:
            raise ValueError("Missing critical column: 'amount' could not be found.")
    else:
        # Standardize amount values (remove currency symbols, commas, etc.)
        df["amount"] = df["amount"].astype(str).str.replace(r'[^\d\.\-]', '', regex=True)
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
        
        # Check if there is a transaction type indicator column (Debit/Credit)
        type_col = None
        for col in df.columns:
            if "type" in col:
                type_col = col
                break
                
        if type_col:
            # Adjust sign based on transaction type (Debit should be negative)
            def adjust_sign(row):
                t = str(row[type_col]).strip().lower()
                val = row["amount"]
                if ("debit" in t or "dr" == t or "wdl" in t or "withdrawal" in t) and val > 0:
                    return -val
                return val
            df["amount"] = df.apply(adjust_sign, axis=1)

    # 3. Clean row records
    # Drop rows with empty descriptions or invalid amounts
    df = df.dropna(subset=["description", "amount"])
    
    # Parse date column safely
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"])
    
    # Convert date to string format YYYY-MM-DD
    df["date"] = df["date"].dt.strftime("%Y-%m-%d")
    
    # Keep only the standardized columns
    final_df = df[["date", "description", "amount"]].copy()
    
    # Clean description spaces
    final_df["description"] = final_df["description"].astype(str).str.strip()
    
    # Drop exact duplicates
    final_df = final_df.drop_duplicates()
    
    return final_df

def parse_csv(file_bytes: bytes) -> pd.DataFrame:
    """Parses a CSV bank statement."""
    # Try reading with default utf-8, fallback to latin-1
    try:
        decoded = file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        decoded = file_bytes.decode("latin-1")
        
    df = pd.read_csv(io.StringIO(decoded))
    return clean_dataframe(df)

def parse_pdf(file_bytes: bytes) -> pd.DataFrame:
    """Parses a PDF bank statement by extracting tables."""
    all_rows = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            table = page.extract_table()
            if table:
                all_rows.extend(table)
                
    if not all_rows:
        raise ValueError("No table data could be extracted from the PDF statement.")
        
    # Find columns (assume the first row with text contains headers)
    headers = [str(h).strip() if h else f"col_{i}" for i, h in enumerate(all_rows[0])]
    
    data_rows = []
    for r in all_rows[1:]:
        # Ensure row length matches header length
        if len(r) == len(headers):
            data_rows.append(r)
        elif len(r) > len(headers):
            data_rows.append(r[:len(headers)])
        else:
            data_rows.append(r + [None] * (len(headers) - len(r)))
            
    df = pd.DataFrame(data_rows, columns=headers)
    return clean_dataframe(df)

def parse_json(file_bytes: bytes) -> pd.DataFrame:
    """Parses a JSON array bank statement."""
    try:
        data = json.loads(file_bytes.decode("utf-8"))
    except Exception:
        data = json.loads(file_bytes.decode("latin-1"))
        
    if not isinstance(data, list):
        raise ValueError("JSON file must contain a root-level array of transaction objects.")
        
    df = pd.DataFrame(data)
    return clean_dataframe(df)
