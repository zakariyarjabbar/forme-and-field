import { LocalOrder } from '@/components/local-pages';
export const metadata = { title: 'Demo order' };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LocalOrder id={id} />;
}
