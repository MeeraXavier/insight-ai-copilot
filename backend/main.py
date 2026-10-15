
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from analytics import calculate_stats, load_feedback

app = FastAPI(
    title="InsightAI API",
    description="Customer Analytics Copilot API",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=False,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Welcome to InsightAI",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/feedback")
def get_feedback():
    df = load_feedback()

    # Convert pandas rows into JSON-serializable dictionaries.
    records = df.copy()
    records["date"] = records["date"].dt.strftime("%Y-%m-%d")

    return records.to_dict(orient="records")


@app.get("/api/stats")
def get_stats():
    df = load_feedback()
    return calculate_stats(df)
