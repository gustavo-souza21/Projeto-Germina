import { redirect } from 'next/navigation';

/* Scanner PAUSADO (análise de XP e gamificação, achado 8, 22/10/2026).

   A rota não aparecia no menu, mas abria por URL e mostrava "+100 XP por
   estudar..." que nunca chegava ao banco — sumia ao recarregar. Enquanto o
   Scanner não for retomado, quem chegar aqui vai para a Biblioteca, que é o
   caminho de estudo que de fato credita XP.

   O componente (components/ScannerClient.tsx + ScannerIA.tsx) e a rota de API
   continuam no repositório. Para retomar: restaurar a página anterior (está no
   histórico do git), reativar SCANNER_ATIVO em app/api/scan-plant/route.ts e
   gravar o XP pelo servidor em ScannerClient. */
export default function ScannerPage() {
  redirect('/biblioteca');
}
