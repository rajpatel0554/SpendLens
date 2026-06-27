import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("data/bank_transactions_raw_1000.csv")

print("\nDataset Shape:")
print(df.shape)

print("\nCategories:")
print(df["category"].value_counts())

plt.figure(figsize=(12,6))

df["category"].value_counts().plot(
    kind="bar"
)

plt.title("Transaction Category Distribution")
plt.xlabel("Category")
plt.ylabel("Count")

plt.tight_layout()

plt.show()