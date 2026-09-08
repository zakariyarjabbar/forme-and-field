import 'server-only';
import { cookies } from 'next/headers';
import { resolveSession } from './store';
export const cookieName = 'ff_demo';
export async function session() {
  return resolveSession((await cookies()).get(cookieName)?.value);
}
