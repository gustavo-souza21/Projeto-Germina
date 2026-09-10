/**
 * Deriva um rótulo curto e um link (quando existir) a partir do texto literal
 * do campo `fotos_fonte` — que reproduz, sem alterações, a linha "Fotos —
 * Fonte:" da curadoria da Sarah B. Freitas (PDF, 2025).
 *
 * Alguns registros trazem só um nome de banco de imagens sem URL (ex:
 * 'iStock', 'Wikimedia Commons') — nesses casos não há link para abrir,
 * só o crédito textual. Quando há mais de uma URL (ex: Goiaba, Abacate),
 * usamos a primeira para o link e indicamos que há mais fontes.
 */
export interface FotoCredito {
  /** Texto curto para exibir, ex: "sites.usp.br" ou "iStock" */
  label: string;
  /** URL para abrir em nova aba, ou null quando a curadoria não informa um link */
  href: string | null;
  /** true quando a curadoria lista mais de uma fonte para a mesma ficha */
  temMaisFontes: boolean;
}

export function parseFotoCredito(fotosFonteTexto: string): FotoCredito {
  const urls = fotosFonteTexto.match(/https?:\/\/[^\s)]+/g) ?? [];
  const primeiraUrl = urls[0] ?? null;

  if (!primeiraUrl) {
    // Sem URL: usa o texto inteiro (ex: 'iStock', 'Wikimedia Commons') como rótulo
    return { label: fotosFonteTexto.trim(), href: null, temMaisFontes: urls.length > 1 };
  }

  // Se o texto tem uma parte descritiva antes da URL (ex: "Reflora – Domingos Cardoso / https://...")
  // usamos essa parte como rótulo; senão, usamos o domínio da própria URL.
  const antesDaUrl = fotosFonteTexto.slice(0, fotosFonteTexto.indexOf(primeiraUrl)).replace(/[/\s–-]+$/, '').trim();

  let label: string;
  if (antesDaUrl && !antesDaUrl.startsWith('http')) {
    label = antesDaUrl;
  } else {
    try {
      label = new URL(primeiraUrl).hostname.replace(/^www\./, '');
    } catch {
      label = primeiraUrl;
    }
  }

  return { label, href: primeiraUrl, temMaisFontes: urls.length > 1 };
}
