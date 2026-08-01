"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="error-page">
      <h1>Could not load the dashboard</h1>
      <p>{error.message}</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
