'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Sprout, Trophy, ChevronRight } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';
import { destinoPosLogin } from '../../../lib/rota-retorno';

const SLIDES = [
  {
    icone: BookOpen,
    titulo: 'Estude as plantas',
    texto: 'Explore o Herbário Digital, conheça os usos tradicionais de cada espécie amazônica e responda os desafios diários pra aprender de verdade.',
  },
  {
    icone: Sprout,
    titulo: 'Ganhe sementes e XP',
    texto: 'Cada planta estudada e cada desafio concluído rendem XP, sementes e moedas — sua evolução no Germina.',
  },
  {
    icone: Trophy,
    titulo: 'Cuide do seu Jardim',
    texto: 'Use as sementes pra plantar no Jardim do Conhecimento, adube pra acelerar o crescimento e desbloqueie novos terrenos conforme sobe de nível.',
  },
];

// useSearchParams() exige fronteira de Suspense (mesmo padrão de /login e
// /redefinir-senha) — sem ela o build de produção falha nesta página.
export default function TutorialPage() {
  return (
    <Suspense fallback={null}>
      <TutorialConteudo />
    </Suspense>
  );
}

function TutorialConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* Fase 4 — o tutorial deixou de ser um beco para o `?next=`.
     O visitante que tenta abrir /jardim é mandado para /login?next=/jardim;
     se ele criar conta ali, cai primeiro no tutorial (que tem precedência,
     porque ninguém deve pular o walkthrough no primeiro acesso) — e, antes
     desta mudança, o destino morria aqui: ele terminava o tutorial e ia parar
     em /inicio, tendo que procurar de novo o que já tinha achado. Justo o
     percurso mais comum de quem acabou de vir do modo visitante. */
  const destinoFinal = destinoPosLogin(searchParams.get('next'));
  const [slideAtual, setSlideAtual] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const ultimoSlide = slideAtual === SLIDES.length - 1;
  const slide = SLIDES[slideAtual];
  const Icone = slide.icone;

  const finalizarTutorial = async () => {
    if (salvando) return;

    setSalvando(true);
    setErro(null);

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setSalvando(false);
      setErro('Sua sessão expirou. Atualize a página e faça login novamente.');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ tutorial_concluido: true })
      .eq('id', user.id);

    if (error) {
      setSalvando(false);
      console.error('Falha ao marcar tutorial como concluído:', error.message);
      setErro('Não foi possível salvar seu progresso agora. Tente novamente.');
      return;
    }

    // Fonte de verdade passa a ser profiles.tutorial_concluido, lido no
    // servidor por irParaProximaTela() (app/(auth)/login) — sem
    // localStorage: aquele caminho antigo não sincronizava entre
    // dispositivos e já foi substituído do lado da leitura desde o A8.
    router.push(destinoFinal);
  };

  return (
    <main className="min-h-screen flex flex-col justify-between px-6 py-12 bg-[var(--color-bg-base)]">
      <button
        onClick={finalizarTutorial}
        disabled={salvando}
        className="self-end text-sm text-[var(--color-blue-deep)]/50 font-medium disabled:opacity-50"
      >
        Pular
      </button>

      <div className="flex flex-col items-center text-center gap-5 max-w-sm mx-auto">
        <div className="w-24 h-24 rounded-3xl bg-[var(--color-card-bg)] shadow-sm border border-[var(--color-green-soft)]/40 flex items-center justify-center">
          <Icone className="w-12 h-12 text-[var(--color-green-main)]" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-green-deep)]">{slide.titulo}</h1>
        <p className="text-sm text-[var(--color-blue-deep)]/70">{slide.texto}</p>
      </div>

      <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === slideAtual ? 'w-6 bg-[var(--color-green-main)]' : 'w-1.5 bg-[var(--color-green-soft)]/50'
              }`}
            />
          ))}
        </div>

        {erro && <p className="text-xs text-red-600 font-semibold text-center">{erro}</p>}

        <button
          onClick={() => (ultimoSlide ? finalizarTutorial() : setSlideAtual((s) => s + 1))}
          disabled={ultimoSlide && salvando}
          className="w-full flex items-center justify-center gap-1.5 py-3.5 rounded-2xl font-semibold text-white bg-[var(--color-green-main)] active:bg-[var(--color-green-deep)] transition-colors disabled:opacity-60"
        >
          {ultimoSlide ? (salvando ? 'Salvando...' : 'Começar a jogar') : 'Próximo'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </main>
  );
}
