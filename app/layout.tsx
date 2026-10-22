import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

/* ============================================================================
   GER-UI-08 — TIPOGRAFIA OFICIAL

   Antes: o app não tinha root layout (o App Router não builda sem ele) e a
   fonte vinha de `font-family: system-ui` no CSS. Na prática isso renderizava
   o GERMINA em San Francisco no iPhone, Roboto no Android e Segoe UI no
   Windows — três identidades diferentes, nenhuma delas a do protótipo.

   Agora a fonte é carregada e auto-hospedada pelo next/font: zero requisição
   ao Google em runtime, zero layout shift (o Next injeta métricas de fallback
   automaticamente) e a mesma renderização em qualquer plataforma.

   ⚠️ PONTO ÚNICO DE TROCA DA FONTE
   Inter é o padrão provisório. A auditoria registrou como pendência confirmar
   com a autora a fonte exata usada no Canva. Quando isso for definido, troque
   APENAS o import e a chamada abaixo — o resto do app consome
   `var(--font-germina)` via o token --font-sans e não precisa ser tocado.

   Ex.: import { Plus_Jakarta_Sans } from 'next/font/google';
        const fonteGermina = Plus_Jakarta_Sans({ ... , variable: '--font-germina' });
   ========================================================================= */
const fonteGermina = Inter({
  subsets: ['latin'],
  display: 'swap',
  // Só os pesos que a escala tipográfica realmente usa. Carregar a família
  // inteira desperdiça banda — relevante para o público em Itacoatiara/AM.
  weight: ['400', '500', '600', '700'],
  variable: '--font-germina',
});

export const metadata: Metadata = {
  /* Base para resolver URLs relativas de Open Graph e Twitter card.
     Sem isto o Next cai em http://localhost:3000 e avisa no build — e o
     sintoma só aparece fora do app: quem compartilha o link no WhatsApp,
     e-mail ou numa apresentação recebe um cartão de preview quebrado,
     apontando para localhost. Importa especialmente aqui, porque o link é
     distribuído para a banca e para alunos.

     Lê de NEXT_PUBLIC_SITE_URL quando definida (permite que previews da
     Vercel resolvam para si mesmas), com a produção como padrão. */
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://germina-next.vercel.app'
  ),
  title: {
    default: 'GERMINA — Saberes da Amazônia',
    template: '%s · GERMINA',
  },
  description:
    'Aprenda sobre plantas medicinais da Amazônia com desafios diários, herbário virtual e o Jardim do Conhecimento.',
  applicationName: 'GERMINA',
  authors: [{ name: 'Sarah Batista de Freitas' }],
  keywords: ['plantas medicinais', 'Amazônia', 'educação', 'RENISUS', 'UFAM'],
};

export const viewport: Viewport = {
  themeColor: '#f9f8f6',
  width: 'device-width',
  initialScale: 1,
  // Não travar o zoom: bloquear pinch-to-zoom quebra a acessibilidade de quem
  // precisa ampliar o texto.
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={fonteGermina.variable}>
      <body>{children}</body>
    </html>
  );
}
