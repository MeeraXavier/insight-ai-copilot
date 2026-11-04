
import { useMemo, useState } from "react";
import "./App.css";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { useApi } from "./hooks/useApi";

type Sentiment = "Positive" | "Neutral" | "Negative";

type Feedback = {
  id: number;
  customer: string;
  rating: number;
  comment: string;
  date: string;
};

type Stats = {
  total_feedback: number;
  average_rating: number;
  rating_distribution: Record<string, number>;
};

function sentimentFor(rating: number): Sentiment {
  if (rating >= 4) return "Positive";
  if (rating === 3) return "Neutral";
  return "Negative";
}

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [search, setSearch] = useState("");
  const [sentiment, setSentiment] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof Feedback>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const {
    data: feedback,
    loading: feedbackLoading,
    error: feedbackError,
    refetch: refetchFeedback,
  } = useApi<Feedback[]>(async () => {
    const response = await fetch(`${API_URL}/api/feedback`);
    if (!response.ok) throw new Error("Failed to fetch feedback data");
    return response.json();
  });

  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useApi<Stats>(async () => {
    const response = await fetch(`${API_URL}/api/stats`);
    if (!response.ok) throw new Error("Failed to fetch statistics");
    return response.json();
  });

  const loading = feedbackLoading || statsLoading;
  const error = feedbackError || statsError;

  const handleRetry = () => {
    refetchFeedback();
    refetchStats();
  };

  const filteredFeedback = useMemo(() => {
    if (!feedback) return [];

    const query = search.trim().toLowerCase();

    return feedback.filter((item) => {
      const matchesSearch =
        item.customer.toLowerCase().includes(query) ||
        item.comment.toLowerCase().includes(query);

      const matchesSentiment =
        sentiment === "All" || sentimentFor(item.rating) === sentiment;

      return matchesSearch && matchesSentiment;
    });
  }, [feedback, search, sentiment]);

  const sortedFeedback = useMemo(() => {
    if (!filteredFeedback) return [];

    return [...filteredFeedback].sort((a, b) => {
      let comparison = 0;

      if (sortColumn === "rating") {
        comparison = a.rating - b.rating;
      } else if (sortColumn === "date") {
        comparison =
          new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        comparison = String(a[sortColumn]).localeCompare(String(b[sortColumn]));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredFeedback, sortColumn, sortDirection]);

  const paginatedFeedback = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedFeedback.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedFeedback, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedFeedback.length / itemsPerPage);

  const handleSort = (column: keyof Feedback) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const sentimentColors: Record<Sentiment, string> = {
    Positive: "positive",
    Neutral: "neutral",
    Negative: "negative",
  };

  const sentiments: Record<Sentiment, number> = {
    Positive:
      (stats?.rating_distribution["4"] ?? 0) +
      (stats?.rating_distribution["5"] ?? 0),
    Neutral: stats?.rating_distribution["3"] ?? 0,
    Negative:
      (stats?.rating_distribution["1"] ?? 0) +
      (stats?.rating_distribution["2"] ?? 0),
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !stats) {
    return (
      <ErrorState
        message={error || "Statistics could not be loaded."}
        onRetry={handleRetry}
      />
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
                  (sentiments.Positive / stats.total_feedback) * 100
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

        {(Object.keys(sentiments) as Sentiment[]).map((key) => {
          const count = sentiments[key] ?? 0;
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
            {sortedFeedback.length} results
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
                <th>
                  <button
                    className="sort-button"
                    onClick={() => handleSort("customer")}
                    aria-sort={
                      sortColumn === "customer"
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    Customer
                    {sortColumn === "customer" && (
                      <span className="sort-indicator">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </th>
                <th>
                  <button
                    className="sort-button"
                    onClick={() => handleSort("comment")}
                    aria-sort={
                      sortColumn === "comment"
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    Feedback
                    {sortColumn === "comment" && (
                      <span className="sort-indicator">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </th>
                <th>
                  <button
                    className="sort-button"
                    onClick={() => handleSort("rating")}
                    aria-sort={
                      sortColumn === "rating"
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    Rating
                    {sortColumn === "rating" && (
                      <span className="sort-indicator">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </th>
                <th>Sentiment</th>
                <th>
                  <button
                    className="sort-button"
                    onClick={() => handleSort("date")}
                    aria-sort={
                      sortColumn === "date"
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    Date
                    {sortColumn === "date" && (
                      <span className="sort-indicator">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedFeedback.map((item) => (
                <tr key={item.id}>
                  <td className="customer-name">{item.customer}</td>
                  <td className="comment-cell">{item.comment}</td>
                  <td>
                    <span className="rating">
                      ★ <span>{item.rating}/5</span>
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${sentimentColors[sentimentFor(item.rating)]}`}
                    >
                      {sentimentFor(item.rating)}
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
              {sortedFeedback.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No feedback matches your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
      </section>

      <footer>
        InsightAI <span>·</span> Customer Analytics Copilot <span>·</span> v0.1
      </footer>
    </main>
  );
}

export default App;
