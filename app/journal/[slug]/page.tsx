import { socialMetadata } from '@/lib/social';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { articles } from '@/lib/content/editorial';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = articles.find((item) => item.slug === slug);
  if (!item) return { title: 'Article not found' };
  return socialMetadata(
    item.title,
    item.intro,
    `/journal/${slug}`,
    `/images/social/journal-${slug}.jpg`,
  );
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params,
    a = articles.find((a) => a.slug === slug);
  if (!a) notFound();
  return (
    <article>
      <header className="article-title">
        <h1>{a.title}</h1>
        <p>
          {a.category} · {a.readTime}
        </p>
      </header>
      <div className="editorial-hero">
        <Image src={a.image} alt={a.title} fill sizes="100vw" preload />
      </div>
      <div className="article-body">
        <p className="article-lede">{a.intro}</p>
        {a.sections.map((s) => (
          <section key={s.title}>
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </section>
        ))}
        <Link href="/journal" className="text-link">
          Back to the journal
        </Link>
      </div>
    </article>
  );
}
