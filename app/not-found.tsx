import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
export default function NotFound() {
  return (
    <div className="empty-state" style={{ minHeight: '55vh' }}>
      <h1>This page has moved out.</h1>
      <p>We couldn’t find that piece or page. There are still good things to discover.</p>
      <Link href="/shop" className="button primary">
        Back to the collection <ArrowRight size={18} />
      </Link>
    </div>
  );
}
