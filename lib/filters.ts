export type Filters = {
  q?: string;
  category?: string;
  material?: string;
  availability?: string;
  min?: string;
  max?: string;
  sort?: string;
};
export type SearchInput = Record<string, string | string[] | undefined>;
export function normalizeFilters(input: SearchInput): Filters {
  const result: Filters = {};
  for (const key of ['q', 'category', 'material', 'availability', 'min', 'max', 'sort'] as const) {
    const raw = input[key],
      value = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, key === 'q' ? 200 : 80);
    if (!value) continue;
    if (
      (key === 'min' || key === 'max') &&
      (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 1000000)
    )
      continue;
    result[key] = value;
  }
  return result;
}
