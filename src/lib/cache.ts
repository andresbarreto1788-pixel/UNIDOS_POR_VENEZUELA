// Caché en memoria con TTL para aliviar la base de datos.
// La búsqueda es de solo lectura y la data cambia poco: cachear las
// consultas frecuentes reduce drásticamente la carga sobre PostgreSQL
// cuando miles de personas buscan a la vez.

type Entry<T> = { value: T; expires: number };
const store = new Map<string, Entry<unknown>>();
const MAX_ENTRIES = 2000;

export async function cached<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expires > now) {
    return hit.value;
  }

  const value = await fn();

  // Evita crecimiento ilimitado: si está lleno, descarta el más viejo
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.set(key, { value, expires: now + ttlMs });
  return value;
}

export function invalidateCache() {
  store.clear();
}
