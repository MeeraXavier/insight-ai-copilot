interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading InsightAI..." }: LoadingStateProps) {
  return (
    <main className="page">
      <div className="loading-container">
        <div className="spinner" aria-hidden="true" />
        <p>{message}</p>
      </div>
    </main>
  );
}
