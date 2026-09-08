import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { articles } from '@/lib/content/editorial';
export const metadata = { title: 'The journal' };
export default function Journal() {
  return (
    <>
      <div className="page-heading">
        <h1>Notes from the studio.</h1>
        <p>
          A closer look at materials, light, and the quiet decisions that bring a room together.
        </p>
      </div>
      <div className="content-wrap journal-grid">
        {articles.map((a, i) => (
          <Link key={a.slug} href={`/journal/${a.slug}`} className="article-card">
            <div className="article-image">
              <Image
                src={a.image}
                alt={a.title}
                fill
                sizes="(max-width:550px) 100vw, 33vw"
                preload={i === 0}
              />
            </div>
            <div className="article-meta">
              <span>{a.category}</span>
              <span>{a.readTime}</span>
            </div>
            <h3>
              {a.title}
              <ArrowUpRight size={21} />
            </h3>
            <p className="small muted" style={{ marginTop: 15 }}>
              {a.intro}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
