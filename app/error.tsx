'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="empty-state">
      <h1>A small interruption.</h1>
      <p>
        This page couldn’t load. Your saved demo data is still in the database. Try again, or return
        to the store.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
      <div>
        <Link className="text-link" href="/">
          Return home
        </Link>
      </div>
    </div>
  );
}
