import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { rooms } from '@/lib/content/editorial';
export const metadata = {
  title: 'Our rooms',
  description: 'Three spaces, thoughtfully composed. Explore and shop the pieces in each room.',
};
export default function RoomsPage() {
  return (
    <>
      <div className="page-heading">
        <h1>Rooms with room for life.</h1>
        <p>
          A few ways to put good pieces together. Take a look around, find what speaks to you, and
          make it your own.
        </p>
      </div>
      <div className="content-wrap room-list">
        {rooms.map((r, i) => (
          <article className="room-list-item" key={r.slug}>
            <Link className="room-list-image" href={`/rooms/${r.slug}`}>
              <Image
                src={r.image}
                alt={r.subtitle}
                fill
                sizes="(max-width:550px) 100vw, 55vw"
                preload={i === 0}
              />
            </Link>
            <div className="room-list-copy">
              <h2>{r.title}</h2>
              <p>{r.intro}</p>
              <Link className="text-link" href={`/rooms/${r.slug}`}>
                Step inside <ArrowRight size={18} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
