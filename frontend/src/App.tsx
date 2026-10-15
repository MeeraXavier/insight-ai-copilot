
import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Sentiment = "Positive" | "Neutral" | "Negative";

type Feedback = {
  id: number;
  customer: string;
  rating: number;
  sentiment: Sentiment;
  comment: string;
  date: string;
};

type Stats = {
  total_feedback: number;
  average_rating: number;
  sentiments: Record<Sentiment, number>;
};

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState("");
  const [sentiment, setSentiment] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [feedbackResponse, statsResponse] = await Promise.all([
          fetch(`${API_URL}/api/feedback`),
          fetch(`${API_URL}/api/stats`),
        ]);

        if (!feedbackResponse.ok || !statsResponse.ok) {
          throw new Error("The API returned an error.");
        }

        const [feedbackData, statsData] = await Promise.all([
          feedbackResponse.json(),
          statsResponse.json(),
        ]);

        setFeedback(feedbackData);
        setStats(statsData);
      } catch {
        setError(
          "Unable to load dashboard data. Check that the FastAPI backend is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const filteredFeedback = useMemo(() => {
    const query = search.trim().toLowerCase();

    return feedback.filter((item) => {
      const matchesSearch =
        item.customer.toLowerCase().includes(query) ||
        item.comment.toLowerCase().includes(query);

      const matchesSentiment =
        sentiment === "All" || item.sentiment === sentiment;

      return matchesSearch && matchesSentiment;
    });
  }, [feedback, search, sentiment]);

  const sentimentColors: Record<Sentiment, string> = {
    Positive: "positive",
    Neutral: "neutral",
    Negative: "negative",
  };

  if (loading) {
    return <main className="page"><p>Loading InsightAI...</p></main>;
  }

  if (error || !stats) {
    return (
      <main className="page">
        <div className="error-box">
          <h2>Dashboard unavailable</h2>
          <p>{error || "Statistics could not be loaded."}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">I</span>
          <span>Insight<span className="brand-accent">AI</span></span>
        </a>
        <span className="environment"><span /> Live API connection</span>
      </header>

      <section className="intro">
        <p className="eyebrow">CUSTOMER INTELLIGENCE</p>
        <h1>Feedback overview</h1>
        <p className="subtitle">
          Understand your customers. Discover opportunities. Make better decisions.
        </p>
      </section>

      <section className="stats-grid" aria-label="Feedback statistics">
        <article className="stat-card">
          <p>Total feedback</p>
          <h2>{stats.total_feedback}</h2>
          <span className="stat-note">Responses collected</span>
        </article>

        <article className="stat-card">
          <p>Average rating</p>
          <h2>{stats.average_rating.toFixed(1)} <span className="star">★</span></h2>
          <span className="stat-note">Out of 5 stars</span>
        </article>

        <article className="stat-card">
          <p>Positive feedback</p>
          <h2>
            {stats.total_feedback
              ? Math.round(
                  (stats.sentiments.Positive / stats.total_feedback) * 100
                )
              : 0}%
          </h2>
          <span className="stat-note">Of all responses</span>
        </article>
      </section>

      <section className="insights-card">
        <div className="section-heading">
          <div>
            <h2>Sentiment distribution</h2>
            <p className="muted">Overview of customer feedback tone</p>
          </div>
        </div>

        {(Object.keys(stats.sentiments) as Sentiment[]).map((key) => {
          const count = stats.sentiments[key] ?? 0;
          const percentage = stats.total_feedback
            ? (count / stats.total_feedback) * 100
            : 0;

          return (
            <div className="sentiment-row" key={key}>
              <div className="sentiment-label">
                <span className={`sentiment-dot ${sentimentColors[key]}`} />
                <span>{key}</span>
                <strong>{count}</strong>
              </div>
              <div className="bar-track">
                <div
                  className={`bar-fill ${sentimentColors[key]}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </section>

      <section className="feedback-card">
        <div className="section-heading">
          <div>
            <h2>Customer feedback</h2>
            <p className="muted">
              Browse and filter individual customer responses
            </p>
          </div>
          <span className="result-count">
            {filteredFeedback.length} results
          </span>
        </div>

        <div className="filters">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search customers or comments..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <select
            aria-label="Filter by sentiment"
            value={sentiment}
            onChange={(event) => setSentiment(event.target.value)}
          >
            <option value="All">All sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Feedback</th>
                <th>Rating</th>
                <th>Sentiment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedback.map((item) => (
                <tr key={item.id}>
                  <td className="customer-name">{item.customer}</td>
                  <td className="comment-cell">{item.comment}</td>
                  <td>
                    <span className="rating">
                      ★ <span>{item.rating}/5</span>
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${sentimentColors[item.sentiment]}`}>
                      {item.sentiment}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(`${item.date}T00:00:00`).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "short", year: "numeric" }
                    )}
                  </td>
                </tr>
              ))}
              {filteredFeedback.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No feedback matches your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer>
        InsightAI <span>·</span> Customer Analytics Copilot <span>·</span> v0.1
      </footer>
    </main>
  );
}

export default App;
