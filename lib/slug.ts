/**
 * Gera um slug de URL a partir do nome popular da planta.
 * Ex: "Hortelã pimenta" -> "hortela-pimenta", "Capim santo" -> "capim-santo".
 * Usado tanto para montar os links na Biblioteca quanto para resolver a rota
 * dinâmica em app/(app)/biblioteca/[slug]/page.tsx.
 */
export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
