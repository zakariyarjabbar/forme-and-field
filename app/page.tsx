import { socialMetadata, brandDescription } from '@/lib/social';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { seedProducts } from '@/lib/content/catalog';
import { articles } from '@/lib/content/editorial';
export const metadata = socialMetadata('FORME & FIELD', brandDescription, '/');
export default async function Home() {
  const products = seedProducts,
    chosen = ['cove-lounge-chair', 'plinth-side-table', 'halo-pendant', 'vale-sofa']
      .map((s) => products.find((p) => p.slug === s))
      .filter((p) => !!p);
  return (
    <>
      <section className="home-opening">
        <div className="opening-title">
          <h1>
            Good rooms begin
            <br />
            with a few <em>good pieces.</em>
          </h1>
          <div>
            <p>
              Considered furniture. Quiet character.
              <br />
              Made for the way you live.
            </p>
            <Link className="text-link" href="/collections/considered-essentials">
              Discover the collection <ArrowRight size={19} />
            </Link>
          </div>
        </div>
        <Link
          href="/rooms/quiet-living"
          className="hero-scene"
          aria-label="A room to come back to — explore our quiet living room"
        >
          <Image
            src="/images/quiet-living.webp"
            alt="An airy sunlit living room with the Vale linen sofa, oak Cove lounge chair, travertine Plinth table and bronze Reed lamp"
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
          />
          <span className="scene-link">
            A room to come back to <ArrowUpRight size={22} />
          </span>
        </Link>
        <div className="photo-caption">
          <span>Natural materials. A little room to breathe.</span>
          <span>Explore the way we put things together.</span>
        </div>
      </section>
      <section className="section selected-pieces">
        <div className="section-heading">
          <h2>Objects to live with.</h2>
          <Link href="/shop" className="text-link">
            Shop all pieces <ArrowRight size={18} />
          </Link>
        </div>
        <div className="product-grid">
          {chosen.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <section className="room-feature">
        <div className="room-feature-intro">
          <h2>
            A place to slow down.
            <br />
            <em>And settle in.</em>
          </h2>
          <p>
            The right pieces leave room for life. Explore a corner composed around comfort,
            daylight, and just one more chapter.
          </p>
        </div>
        <div className="room-feature-image">
          <Image
            src="/images/reading-corner.webp"
            alt="Cove chair, Plinth table and Reed lamp arranged as a quiet reading corner"
            fill
            sizes="(max-width:768px) 100vw, 80vw"
          />
          <Link className="button paper room-shop-link" href="/rooms/reading-corner">
            Shop this room <ArrowUpRight size={19} />
          </Link>
        </div>
        <div className="room-footnote">
          <span>Cove, Plinth & Reed. Three pieces, one small retreat.</span>
          <Link href="/rooms" className="text-link">
            All our rooms <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <section className="material-story section">
        <div className="material-image">
          <Image
            src="/images/arc-dining-table-detail.webp"
            alt="Close view of the Arc table's oak grain and eased edge"
            fill
            sizes="(max-width:768px) 100vw, 40vw"
          />
        </div>
        <div className="material-copy">
          <h2>
            Good design starts
            <br />
            <em>with what it’s made of.</em>
          </h2>
          <p>
            The grain in oak. The weave of linen. The quiet weight of stone. We begin with materials
            that ask to be touched, and give them shapes that feel at home.
          </p>
          <Link className="text-link" href="/about">
            Our approach to materials <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <section className="lighting-section">
        <div className="lighting-heading">
          <h2>
            When the light
            <br />
            <em>gets low.</em>
          </h2>
          <p>
            A softer glow. A different mood.
            <br />
            Lighting for the quieter hours.
          </p>
          <Link className="text-link" href="/shop?category=Lighting">
            Explore lighting <ArrowRight size={18} />
          </Link>
        </div>
        <div className="lighting-large">
          <Link href="/products/reed-floor-lamp">
            <Image
              src="/images/reed-floor-lamp-alternate.webp"
              alt="Reed floor lamp directing warm light onto a reading space"
              fill
              sizes="(max-width:768px) 100vw, 40vw"
            />
            <span>
              Reed floor lamp <ArrowUpRight size={19} />
            </span>
          </Link>
        </div>
        <div className="lighting-small">
          <Link href="/products/halo-pendant">
            <div>
              <Image
                src="/images/halo-pendant.webp"
                alt="Halo opal glass pendant with a brushed brass stem"
                fill
                sizes="(max-width:768px) 50vw, 25vw"
              />
            </div>
            <span>
              Halo pendant <ArrowUpRight size={19} />
            </span>
          </Link>
        </div>
      </section>
      <section className="section journal-section">
        <div className="section-heading">
          <h2>Notes from the studio.</h2>
          <Link href="/journal" className="text-link">
            Read the journal <ArrowRight size={18} />
          </Link>
        </div>
        <div className="journal-grid">
          {articles.map((a) => (
            <Link href={`/journal/${a.slug}`} className="article-card" key={a.slug}>
              <div className="article-image">
                <Image src={a.image} alt={a.title} fill sizes="(max-width:600px) 100vw, 33vw" />
              </div>
              <div className="article-meta">
                <span>{a.category}</span>
                <span>{a.readTime}</span>
              </div>
              <h3>
                {a.title}
                <ArrowUpRight size={20} />
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
