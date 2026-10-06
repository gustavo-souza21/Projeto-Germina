'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BalaoSarah } from './BalaoSarah';
import { FALAS_SARAH, type FalaGuia } from '../../data/guiaSarah';
import { createClient } from '../../lib/supabase/client';

/* ============================================================================
   O GUIA — quem decide o que a Sarah fala, e quando

   Montado uma vez no layout de `(app)`, acompanha a rota e escolhe a fala que
   cabe no momento. O componente de UI (BalaoSarah) não sabe nada disso: ele
   recebe textos prontos e os mostra.

   DIAS SEM ATIVIDADE — de onde sai

   A saudação de retorno ("Curador(a)? É você mesmo?") precisa saber há quanto
   tempo a pessoa sumiu. Em vez de criar uma coluna `ultima_visita` — que
   exigiria uma escrita no banco a cada carregamento de página, custo real
   para um recurso cosmético —, o dado vem da tabela `atividades`, que já
   registra toda ação de jogo desde a Migration 3. A última atividade é uma
   boa definição de "última vez que esta pessoa esteve de fato aqui": quem
   abriu o app e não fez nada não "voltou", só passou.
   ========================================================================= */

/** A partir de quantos dias parado a Sarah comemora o retorno. */
const DIAS_PARA_SAUDAR_RETORNO = 3;

/** Onde o visitante sem conta guarda o que já viu (dura o tempo da aba). */
const CHAVE_SESSAO_VISITANTE = 'germina_guia_visto';

function casaRota(pathname: string, rota: string): boolean {
  return pathname === rota || pathname.startsWith(`${rota}/`);
}

export function GuiaSarah({
  logado,
  falasVistasIniciais,
  diasSemAtividade,
}: {
  logado: boolean;
  /** Ids já vistos, lidos no servidor. Vazio para visitante. */
  falasVistasIniciais: string[];
  /** `null` quando nunca houve atividade (conta nova) ou para visitante. */
  diasSemAtividade: number | null;
}) {
  const pathname = usePathname() ?? '';
  const [vistas, setVistas] = useState<string[]>(falasVistasIniciais);
  const [dispensadasNestaSessao, setDispensadas] = useState<string[]>([]);

  // Visitante: recupera da aba o que ele já viu, para a Sarah não repetir a
  // apresentação a cada navegação. Em try/catch porque sessionStorage lança
  // em aba anônima de alguns navegadores e em contextos de privacidade — e
  // uma dica que não aparece é muito melhor do que uma tela que quebra.
  useEffect(() => {
    if (logado) return;
    try {
      const salvo = sessionStorage.getItem(CHAVE_SESSAO_VISITANTE);
      if (salvo) setVistas(JSON.parse(salvo) as string[]);
    } catch {
      /* sem persistência para esta aba — a Sarah se repete, e tudo bem */
    }
  }, [logado]);

  const falaAtual: FalaGuia | null = useMemo(() => {
    const candidatas = FALAS_SARAH.filter((f) => {
      if (vistas.includes(f.id) || dispensadasNestaSessao.includes(f.id)) return false;

      switch (f.gatilho.tipo) {
        case 'primeira_visita':
          return logado && casaRota(pathname, f.gatilho.rota);
        case 'visitante':
          return !logado && casaRota(pathname, f.gatilho.rota);
        case 'retorno':
          return (
            logado &&
            diasSemAtividade !== null &&
            diasSemAtividade >= DIAS_PARA_SAUDAR_RETORNO
          );
      }
    });

    if (candidatas.length === 0) return null;
    return candidatas.sort((a, b) => a.prioridade - b.prioridade)[0];
  }, [pathname, logado, vistas, dispensadasNestaSessao, diasSemAtividade]);

  const marcarComoVista = useCallback(
    async (falaId: string) => {
      // Some da tela imediatamente — a gravação é detalhe de bastidor e não
      // deve segurar a interface. Se falhar, o pior caso é a Sarah repetir a
      // dica no próximo acesso.
      setDispensadas((d) => [...d, falaId]);

      if (!logado) {
        try {
          const atualizado = [...vistas, falaId];
          sessionStorage.setItem(CHAVE_SESSAO_VISITANTE, JSON.stringify(atualizado));
          setVistas(atualizado);
        } catch {
          /* idem */
        }
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('guia_falas_vistas')
        .upsert(
          { user_id: user.id, fala_id: falaId },
          { onConflict: 'user_id,fala_id' }
        );

      if (error) {
        console.error('Falha ao registrar fala do guia como vista:', error.message);
        return;
      }
      setVistas((v) => [...v, falaId]);
    },
    [logado, vistas]
  );

  if (!falaAtual) return null;

  return (
    <BalaoSarah
      // key força o balão a recomeçar do primeiro quando a fala muda —
      // sem isto, trocar de seção manteria o índice interno da fala anterior.
      key={falaAtual.id}
      baloes={falaAtual.baloes}
      destaque={falaAtual.destaque}
      onFechar={() => marcarComoVista(falaAtual.id)}
    />
  );
}
