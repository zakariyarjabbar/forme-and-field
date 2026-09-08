'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Search, Heart, ShoppingBag, Menu, UserRound, ArrowRight } from 'lucide-react';
import { useStore } from './store-provider';
import { Dialog } from './dialog';
export function Wordmark() {
  return (
    <span className="wordmark">
      FORME <i>&</i> FIELD
    </span>
  );
}
export function Header() {
  const store = useStore(),
    [menu, setMenu] = useState(false),
    [search, setSearch] = useState(false);
  const count = store.cart.reduce((n, l) => n + l.quantity, 0);
  return (
    <>
      <div className="service-strip">
        <span>Furniture, lighting, and the spaces between.</span>
        <Link href="/delivery-returns">Complimentary standard delivery on orders $1,500+</Link>
      </div>
      <header className="site-header">
        <nav className="header-nav" aria-label="Main navigation">
          <Link href="/shop">Shop all</Link>
          <Link href="/rooms">Our rooms</Link>
          <Link href="/about">The studio</Link>
        </nav>
        <button
          className="icon-button mobile-menu"
          aria-label="Open navigation"
          onClick={() => setMenu(true)}
        >
          <Menu size={23} />
        </button>
        <Link className="brand-link" href="/" aria-label="FORME & FIELD home">
          <Wordmark />
        </Link>
        <nav className="header-tools" aria-label="Shopping">
          <button
            className="icon-button"
            onClick={() => setSearch(true)}
            aria-label="Search pieces"
          >
            <Search size={21} />
          </button>
          <Link className="icon-button account-link" href="/account" aria-label="Your demo account">
            <UserRound size={21} />
          </Link>
          <Link
            className="icon-button saved-link"
            href="/wishlist"
            aria-label={`Saved pieces (${store.wishlist.length})`}
          >
            <Heart size={21} />
            {store.wishlist.length > 0 && <span className="counter-dot" />}
          </Link>
          <button
            className="bag-button"
            onClick={store.openCart}
            aria-label={`Open bag, ${count} items`}
          >
            <ShoppingBag size={21} />
            <span className="bag-label">Bag</span>
            <span className="bag-count">{count}</span>
          </button>
        </nav>
      </header>
      <Dialog open={menu} onClose={() => setMenu(false)} title="Explore" drawer>
        <nav className="mobile-nav">
          {[
            ['/shop', 'Shop all pieces'],
            ['/shop?category=Seating', 'Seating'],
            ['/shop?category=Tables', 'Tables'],
            ['/shop?category=Lighting', 'Lighting'],
            ['/shop?category=Storage', 'Storage'],
            ['/shop?category=Objects', 'Objects'],
            ['/rooms', 'Our rooms'],
            ['/journal', 'The journal'],
            ['/about', 'The studio'],
            ['/wishlist', 'Saved pieces'],
            ['/account', 'Your account'],
            ['/demo', 'Explore the demo'],
          ].map(([href, label]) => (
            <Link href={href} key={href} onClick={() => setMenu(false)}>
              {label}
              <ArrowRight size={20} />
            </Link>
          ))}
        </nav>
      </Dialog>
      <Dialog open={search} onClose={() => setSearch(false)} title="Find your next piece" wide>
        <form action="/search" className="search-form" onSubmit={() => setSearch(false)}>
          <label htmlFor="header-search">Search furniture, lighting or materials</label>
          <div className="input-with-button">
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder="Try oak, a lounge chair, or warm lighting"
              autoComplete="off"
              required
            />
            <button className="button primary" type="submit" aria-label="Search">
              <Search size={20} />
            </button>
          </div>
        </form>
        <div className="popular-searches">
          <span className="small muted">A few places to start</span>
          {['Seating', 'Lighting', 'Tables'].map((c) => (
            <Link key={c} href={`/shop?category=${c}`} onClick={() => setSearch(false)}>
              {c}
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      </Dialog>
    </>
  );
}
