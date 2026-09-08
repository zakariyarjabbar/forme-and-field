import { session } from '@/lib/server/session';
import { adminData, assetLibrary } from '@/lib/server/store';
import { DemoEntry } from '@/components/demo';
import { AdminDashboard } from '@/components/admin-dashboard';
export const metadata = { title: 'Merchant view' };
export default async function Admin() {
  const ws = await session();
  if (!ws?.entered) return <DemoEntry destination="/admin" />;
  return <AdminDashboard data={adminData(ws.id)} assets={assetLibrary} />;
}
