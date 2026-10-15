
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="InsightAI API",
    description="Customer Analytics Copilot API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)

FEEDBACK = [
    {
        "id": 1,
        "customer": "Olivia Martin",
        "rating": 5,
        "sentiment": "Positive",
        "comment": "Excellent product and incredibly helpful support team.",
        "date": "2026-10-14",
    },
    {
        "id": 2,
        "customer": "James Wilson",
        "rating": 4,
        "sentiment": "Positive",
        "comment": "Easy to use, but onboarding could be a little faster.",
        "date": "2026-10-13",
    },
    {
        "id": 3,
        "customer": "Sophia Chen",
        "rating": 2,
        "sentiment": "Negative",
        "comment": "The application is slow when loading large reports.",
        "date": "2026-10-13",
    },
    {
        "id": 4,
        "customer": "Liam Johnson",
        "rating": 3,
        "sentiment": "Neutral",
        "comment": "The features are useful, but the pricing is confusing.",
        "date": "2026-10-12",
    },
    {
        "id": 5,
        "customer": "Ava Thompson",
        "rating": 5,
        "sentiment": "Positive",
        "comment": "Great experience! The dashboard saves our team time.",
        "date": "2026-10-12",
    },
    {
        "id": 6,
        "customer": "Noah Williams",
        "rating": 1,
        "sentiment": "Negative",
        "comment": "I had trouble signing in and could not get help quickly.",
        "date": "2026-10-11",
    },
    {
        "id": 7,
        "customer": "Isabella Brown",
        "rating": 4,
        "sentiment": "Positive",
        "comment": "Helpful analytics and a clean, intuitive interface.",
        "date": "2026-10-10",
    },
    {
        "id": 8,
        "customer": "Ethan Davis",
        "rating": 3,
        "sentiment": "Neutral",
        "comment": "It works well overall, although some reports need improvement.",
        "date": "2026-10-09",
    },
]


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
    return FEEDBACK


@app.get("/api/stats")
def get_stats():
    total = len(FEEDBACK)
    average_rating = (
        round(sum(item["rating"] for item in FEEDBACK) / total, 1)
        if total
        else 0
    )

    sentiments = {
        sentiment: sum(
            1 for item in FEEDBACK
            if item["sentiment"] == sentiment
        )
        for sentiment in ["Positive", "Neutral", "Negative"]
    }

    return {
        "total_feedback": total,
        "average_rating": average_rating,
        "sentiments": sentiments,
    }
