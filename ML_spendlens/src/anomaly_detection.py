import pandas as pd


def detect_anomalies(df):

    # Convert date column
    df["date"] = pd.to_datetime(
        df["date"],
        dayfirst=True,
        errors="coerce"
    )

    # Remove invalid dates
    df = df.dropna(subset=["date"])

    # Create month column
    df["month"] = df["date"].dt.to_period("M")

    # Monthly summary
    monthly_spend = (
        df.groupby(["category", "month"])
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

        category_data = monthly_spend[
            monthly_spend["category"] == category
        ].copy()

        category_data = category_data.sort_values(
            "month"
        )

        if len(category_data) < 4:
            continue

        for i in range(3, len(category_data)):

            current_month = category_data.iloc[i]

            previous_3_months = category_data.iloc[
                i-3:i
            ]

            avg_spend = previous_3_months[
                "current_spend"
            ].mean()

            current_spend = current_month[
                "current_spend"
            ]

            if avg_spend <= 0:
                continue

            ratio = round(
                current_spend / avg_spend,
                2
            )

            status = (
                "ANOMALY"
                if ratio > 2
                else "NORMAL"
            )

            row = {

                "category": category,

                "month": str(
                    current_month["month"]
                ),

                "current_spend": round(
                    current_spend,
                    2
                ),

                "avg_last_3_months": round(
                    avg_spend,
                    2
                ),

                "transaction_count": int(
                    current_month[
                        "transaction_count"
                    ]
                ),

                "ratio": ratio,

                "status": status
            }

            # Save all records
            monthly_analysis.append(row)

            # Save only anomalies
            if ratio > 2:

                anomaly_row = row.copy()

                anomaly_row["reason"] = (
                    f"{category} spend is "
                    f"{ratio}x your "
                    f"3-month average"
                )

                anomalies.append(
                    anomaly_row
                )

    anomaly_df = pd.DataFrame(
        anomalies
    )

    analysis_df = pd.DataFrame(
        monthly_analysis
    )

    # Sort anomalies
    if not anomaly_df.empty:

        anomaly_df = anomaly_df.sort_values(
            by="ratio",
            ascending=False
        ).reset_index(
            drop=True
        )

        anomaly_df["ratio"] = (
            anomaly_df["ratio"]
            .astype(str)
            + "x"
        )

    # Sort full analysis
    if not analysis_df.empty:

        analysis_df = analysis_df.sort_values(
            by="ratio",
            ascending=False
        ).reset_index(
            drop=True
        )

    return anomaly_df, analysis_df


# =====================================
# TESTING
# =====================================

if __name__ == "__main__":

    df = pd.read_csv(
        "data/categorized_transactions.csv"
    )

    anomalies, analysis = detect_anomalies(df)

    print(
        "\n========== ANOMALIES FOUND ==========\n"
    )

    print(anomalies)

    anomalies.to_csv(
        "data/anomalies.csv",
        index=False
    )

    analysis.to_csv(
        "data/monthly_analysis.csv",
        index=False
    )

    print(
        f"\nTotal Anomalies Found: "
        f"{len(anomalies)}"
    )

    print(
        "\nSaved:"
    )

    print(
        "- data/anomalies.csv"
    )

    print(
        "- data/monthly_analysis.csv"
    )