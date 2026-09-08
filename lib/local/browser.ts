import { z } from 'zod';
import {
  applyAction,
  decode,
  initialData,
  STORAGE_KEY,
  type LocalData,
  type Result,
} from './store';
type Snapshot = { data: LocalData; ready: boolean; error: string };
const serverSnapshot: Snapshot = { data: initialData(), ready: false, error: '' };
let snapshot = serverSnapshot;
const listeners = new Set<() => void>();
function publish(next: Snapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}
function storageError(e: unknown) {
  if (e instanceof Error && e.message.startsWith('Saved browser')) return e.message;
  return 'Browser storage is unavailable or full. No changes were saved. Enable site storage or reset this browser demo.';
}
function reload() {
  try {
    publish({ data: decode(localStorage.getItem(STORAGE_KEY)), ready: true, error: '' });
  } catch (e) {
    publish({ ...snapshot, ready: true, error: storageError(e) });
  }
}
function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY || event.key === null) reload();
}
export function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    window.addEventListener('storage', onStorage);
    window.addEventListener('pageshow', reload);
    window.addEventListener('focus', reload);
    queueMicrotask(reload);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pageshow', reload);
      window.removeEventListener('focus', reload);
    }
  };
}
export const getSnapshot = () => snapshot;
export const getServerSnapshot = () => serverSnapshot;
export async function mutateBrowser(input: Record<string, unknown>): Promise<Result> {
  // Serialize read/modify/write across tabs; localStorage alone has no transaction primitive.
  if (!navigator.locks)
    throw new Error(
      'This browser cannot safely save the demo. Use a current browser over HTTPS or localhost.',
    );
  return navigator.locks.request(STORAGE_KEY, () => {
    let source: LocalData;
    try {
      source =
        input.action === 'reset' && input.confirmation === 'RESET'
          ? initialData()
          : decode(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      const error = storageError(e);
      publish({ ...snapshot, ready: true, error });
      throw new Error(error);
    }
    let outcome;
    try {
      outcome = applyAction(source, input);
    } catch (e) {
      if (e instanceof z.ZodError) throw new Error(e.issues.map((i) => i.message).join(' '));
      throw e;
    }
    const { data, result } = outcome;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      const error = storageError(e);
      publish({ ...snapshot, ready: true, error });
      throw new Error(error);
    }
    publish({ data, ready: true, error: '' });
    return result;
  });
}
