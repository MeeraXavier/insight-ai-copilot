interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorState({
  title = "Dashboard unavailable",
  message,
  onRetry,
  showRetry = true,
}: ErrorStateProps) {
  return (
    <main className="page">
      <div className="error-box">
        <div className="error-icon" aria-hidden="true">⚠️</div>
        <h2>{title}</h2>
        <p>{message}</p>
        {showRetry && onRetry && (
          <button onClick={onRetry} className="retry-button">
            Try again
          </button>
        )}
      </div>
    </main>
  );
}
