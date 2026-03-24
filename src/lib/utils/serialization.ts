export function toPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
