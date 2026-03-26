'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>

      {error.digest && (
        <p className="rounded-lg border border-border/60 bg-foreground/5 px-4 py-2 font-mono text-xs text-foreground/60">
          Digest: {error.digest}
        </p>
      )}

      <button
        onClick={reset}
        className="rounded-2xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
