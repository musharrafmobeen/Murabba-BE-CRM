export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '');
}

export function addMs(ms: number, from = new Date()): Date {
  return new Date(from.getTime() + ms);
}
