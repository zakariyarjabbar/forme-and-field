import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
export const metadata = { title: 'The studio' };
export default function About() {
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>The studio</span>
      </div>
      <section className="studio-intro">
        <h1>
          A little thought.
          <br />
          <em>A better everyday.</em>
        </h1>
        <p>
          FORME & FIELD is a fictional design studio built around a simple idea: the things we use
          every day deserve to be considered. A comfortable angle. A useful height. An edge that
          feels good beneath your hand. We look for the point where proportion, material, and
          ordinary life meet.
        </p>
      </section>
      <div className="editorial-hero">
        <Image
          src="/images/gathered-around.webp"
          alt="An oak Arc table with Line chairs and a Halo pendant in a naturally lit room"
          fill
          sizes="100vw"
          preload
        />
      </div>
      <section className="section">
        <div className="section-heading">
          <h2>What makes a piece feel right.</h2>
        </div>
        <div className="studio-principles">
          <div>
            <h3>Proportion, before more.</h3>
            <p>
              A wide table with a softened edge. A low seat with room for your shoulders. We begin
              by considering the shape of everyday use, and remove what gets in its way.
            </p>
          </div>
          <div>
            <h3>Materials with a voice.</h3>
            <p>
              Oak carries a grain. Linen has a weave. Stone holds a quiet weight. Our imagined
              collection leaves these qualities visible, giving each material room to be itself.
            </p>
          </div>
          <div>
            <h3>A place in your life.</h3>
            <p>
              A good piece should work on an ordinary Tuesday. We compose rooms around reading,
              gathering and putting things away, with enough space left for the life in between.
            </p>
          </div>
        </div>
        <Link
          className="text-link"
          style={{ marginTop: 30 }}
          href="/collections/considered-essentials"
        >
          Meet the collection <ArrowRight size={18} />
        </Link>
      </section>
      <div className="prose" style={{ paddingTop: 0 }}>
        <h2>A note about this studio.</h2>
        <p>
          FORME & FIELD is a portfolio concept, not an operating furniture business. The brand,
          catalog and room photography were created for this interactive demonstration. No products
          are sold or shipped, and there are no claims of real manufacturing, customers,
          certifications or commercial results.
        </p>
        <Link href="/demo">Explore how the demonstration works</Link>
      </div>
    </>
  );
}
