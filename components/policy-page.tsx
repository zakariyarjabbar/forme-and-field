import Link from 'next/link';
import { policies } from '@/lib/content/policies';
export function PolicyPage({ slug }: { slug: string }) {
  const p = policies[slug];
  return (
    <article className="prose">
      <h1>{p.title}</h1>
      <p>{p.intro}</p>
      {p.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          <p>{s.body}</p>
        </section>
      ))}
      <Link className="text-link" href="/contact">
        Still have a question?
      </Link>
    </article>
  );
}
