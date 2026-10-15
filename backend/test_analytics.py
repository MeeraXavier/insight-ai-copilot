
from analytics import calculate_stats, load_feedback


def main():
    df = load_feedback()
    stats = calculate_stats(df)

    print("Dataset preview:")
    print(df.head())

    print("\nDataset information:")
    print(f"Rows: {len(df)}")
    print(f"Columns: {list(df.columns)}")

    print("\nCalculated statistics:")
    print(stats)


if __name__ == "__main__":
    main()
