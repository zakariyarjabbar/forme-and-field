import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Wordmark } from './header';
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-statement">
          <h2>
            Fewer things.
            <br />
            <em>More meaning.</em>
          </h2>
          <p>Considered pieces for the way you live.</p>
          <Link className="text-link" href="/about">
            Get to know the studio <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="footer-links">
          <div>
            <h3>Explore</h3>
            <Link href="/shop">All pieces</Link>
            <Link href="/rooms">Our rooms</Link>
            <Link href="/journal">The journal</Link>
            <Link href="/wishlist">Saved pieces</Link>
          </div>
          <div>
            <h3>Here to help</h3>
            <Link href="/contact">Contact</Link>
            <Link href="/delivery-returns">Delivery & returns</Link>
            <Link href="/care">Material care</Link>
            <Link href="/account">Your account</Link>
          </div>
          <div>
            <h3>Behind the concept</h3>
            <Link href="/demo">Explore the demo</Link>
            <Link href="/admin">Merchant view</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
      <div className="footer-brand">
        <Wordmark />
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} FORME & FIELD — a fictional design concept.</span>
        <span>No products are sold or shipped. All transactions are simulated.</span>
        <span>English / USD</span>
      </div>
    </footer>
  );
}
