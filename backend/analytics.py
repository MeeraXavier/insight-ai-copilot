
from pathlib import Path

import pandas as pd

DATA_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "customer_feedback.csv"
)


def load_feedback() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)

    required_columns = {"id", "customer", "rating", "comment", "date"}
    missing = required_columns - set(df.columns)

    if missing:
        raise ValueError(
            f"Dataset is missing columns: {sorted(missing)}"
        )

    df["rating"] = pd.to_numeric(df["rating"], errors="raise")

    if not df["rating"].between(1, 5).all():
        raise ValueError("Ratings must be between 1 and 5.")

    df["date"] = pd.to_datetime(df["date"], errors="raise")

    return df


def calculate_stats(df: pd.DataFrame) -> dict:
    total = len(df)

    if total == 0:
        return {
            "total_feedback": 0,
            "average_rating": 0,
            "rating_distribution": {},
        }

    distribution = (
        df["rating"]
        .value_counts()
        .reindex([1, 2, 3, 4, 5], fill_value=0)
        .sort_index()
    )

    return {
        "total_feedback": total,
        "average_rating": round(float(df["rating"].mean()), 1),
        "rating_distribution": {
            str(int(rating)): int(count)
            for rating, count in distribution.items()
        },
    }
