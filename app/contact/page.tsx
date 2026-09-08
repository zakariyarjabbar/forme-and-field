import Link from 'next/link';
import { ContactForm } from '@/components/contact-form';
export const metadata = { title: 'Get in touch' };
export default function Contact() {
  return (
    <>
      <div className="page-heading">
        <h1>Let’s talk about your space.</h1>
        <p>A question about a piece, a finish, or how things come together. Start here.</p>
      </div>
      <div className="contact-layout">
        <aside>
          <h2>A considered conversation.</h2>
          <p>
            This concept inquiry form saves your message in your own demo workspace. You can then
            find it in the merchant view, along with a local acknowledgment preview.
          </p>
          <p>
            Sample studio address:
            <br />
            hello@formeandfield.example
          </p>
          <Link className="text-link" href="/delivery-returns">
            Delivery & returns information
          </Link>
          <br />
          <Link className="text-link" href="/demo">
            Explore the customer & merchant demo
          </Link>
        </aside>
        <ContactForm />
      </div>
    </>
  );
}
