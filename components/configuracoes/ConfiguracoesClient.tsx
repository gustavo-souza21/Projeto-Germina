'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, KeyRound, MapPin, Trash2, Bell, HeartHandshake, Repeat, ShieldCheck,
  Download, Trash, Palette, FileText, MessageCircleWarning, LogOut, ArrowLeft,
} from 'lucide-react';
import { Profile, GameState, Preferencias } from '../../lib/types';
import { createClient } from '../../lib/supabase/client';
import type { Database } from '../../lib/supabase/database.types';
import { SettingsSection } from './SettingsSection';
import { SettingsItemLink, SettingsItemToggle } from './SettingsItem';
import {
  EditarPerfilModal, LocalizacaoModal, ExcluirContaModal, ExportarDadosModal, LimparCacheModal,
} from './ConfiguracoesModals';

type ModalAberto = null | 'editar_perfil' | 'localizacao' | 'excluir_conta' | 'exportar_dados' | 'limpar_cache';

const TEMAS = [
  { id: 'Padrao', nome: 'Verde Amazônia' },
  { id: 'Amazonia Profunda', nome: 'Floresta Densa' },
  { id: 'Floresta Encantada', nome: 'Bioluminescente' },
  { id: 'Rio Negro', nome: 'Rio Negro' },
];

/**
 * `Preferencias` usa chaves em camelCase (histórico do protótipo em código);
 * a tabela `preferencias` usa snake_case. Um switch tipado em vez de um objeto
 * `Record` + acesso dinâmico porque o `Update` gerado por tabela não aceita
 * uma chave de coluna calculada em tempo de execução sem recorrer a `as any`.
 */
function construirAtualizacaoPreferencia(
  chave: keyof Omit<Preferencias, 'unidades'>,
  valor: boolean
): Database['public']['Tables']['preferencias']['Update'] {
  switch (chave) {
    case 'lembreteDesafioDiario':
      return { lembrete_desafio_diario: valor };
    case 'alertasMural':
      return { alertas_mural: valor };
    case 'solicitacoesTroca':
      return { solicitacoes_troca: valor };
    case 'herbarioPublico':
      return { herbario_publico: valor };
    case 'disponivelParaTrocas':
      return { disponivel_para_trocas: valor };
  }
}

export function ConfiguracoesClient({
  profileInicial,
  gameStateInicial,
  preferenciasIniciais,
}: {
  profileInicial: Profile;
  gameStateInicial: GameState;
  preferenciasIniciais: Preferencias;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(profileInicial);
  const [gameState, setGameState] = useState(gameStateInicial);
  const [preferencias, setPreferencias] = useState(preferenciasIniciais);
  const [modalAberto, setModalAberto] = useState<ModalAberto>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const avisarErro = (msg: string) => {
    setMensagemErro(msg);
    setTimeout(() => setMensagemErro(null), 4000);
  };

  const handleToggle = async (chave: keyof Omit<Preferencias, 'unidades'>, valor: boolean) => {
    const anterior = preferencias;

    // Optimistic UI Update: o toggle reage na hora; reverte se a escrita
    // no Supabase falhar.
    setPreferencias((prev) => ({ ...prev, [chave]: valor }));

    const supabase = createClient();
    const { error } = await supabase
      .from('preferencias')
      .update(construirAtualizacaoPreferencia(chave, valor))
      .eq('user_id', profile.id);

    if (error) {
      setPreferencias(anterior);
      console.error('Falha ao atualizar preferência:', error.message);
      avisarErro('Não foi possível salvar essa preferência agora.');
    }
  };

  const handleUpdateTema = async (tema: string) => {
    const anterior = gameState;

    setGameState((prev) => ({ ...prev, tema_ativo: tema }));
    document.documentElement.setAttribute('data-tema', tema);

    const supabase = createClient();
    const { error } = await supabase
      .from('game_state')
      .update({ tema_ativo: tema })
      .eq('user_id', profile.id);

    if (error) {
      setGameState(anterior);
      console.error('Falha ao atualizar tema:', error.message);
      avisarErro('Não foi possível salvar o tema agora.');
    }
  };

  const handleSalvarPerfil = async (dados: Partial<Profile>) => {
    const anterior = profile;

    setProfile((prev) => ({ ...prev, ...dados }));

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        ...(dados.nome_completo !== undefined && { nome_completo: dados.nome_completo }),
        ...(dados.instituicao !== undefined && { instituicao: dados.instituicao }),
      })
      .eq('id', profile.id);

    if (error) {
      setProfile(anterior);
      console.error('Falha ao atualizar perfil:', error.message);
      avisarErro('Não foi possível salvar seu perfil agora. Tente novamente.');
    }
  };

  const handleSalvarLocalizacao = async (endereco: string) => {
    const anterior = profile;

    setProfile((prev) => ({ ...prev, endereco }));

    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ endereco }).eq('id', profile.id);

    if (error) {
      setProfile(anterior);
      console.error('Falha ao atualizar localização:', error.message);
      avisarErro('Não foi possível salvar sua localização agora. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // router.push (não router.refresh) de propósito: o middleware só decide
    // "sem sessão → /login" na PRÓXIMA navegação — push força essa navegação
    // imediatamente em vez de deixar o usuário parado numa tela agora órfã.
    router.push('/login');
  };

  const handleExcluirConta = async () => {
    try {
      const resposta = await fetch('/api/conta', { method: 'DELETE' });
      if (!resposta.ok) {
        const corpo: { erro?: string } | null = await resposta.json().catch(() => null);
        throw new Error(corpo?.erro ?? 'Falha ao excluir a conta.');
      }
      // Conta e todos os dados já foram removidos no servidor (cascata via
      // FK, ver app/api/conta/route.ts). Não há mais sessão pra manter — vai
      // direto pra splash, não pra /login.
      router.push('/splash');
    } catch (err) {
      console.error('Falha ao excluir conta:', err);
      avisarErro('Não foi possível excluir sua conta agora. Tente novamente.');
      // Propaga pro modal poder reabilitar o botão (ver ExcluirContaModal) —
      // sem isto, uma falha deixaria "Excluindo..." travado na tela.
      throw err;
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8 max-w-lg mx-auto">
      <Link href="/perfil" className="flex items-center gap-1.5 text-sm text-blue-main font-bold">
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Perfil
      </Link>

      {mensagemErro && (
        <div className="bg-red-50 border border-red-200 text-red-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm">
          <span>{mensagemErro}</span>
          <button onClick={() => setMensagemErro(null)} className="text-xs font-bold">Fechar</button>
        </div>
      )}

      <SettingsSection title="Conta e Segurança" icon={User} badge="Principal">
        <SettingsItemLink
          icon={User}
          title="Editar Perfil"
          subtitle="Nome e instituição"
          onClick={() => setModalAberto('editar_perfil')}
        />
        {/* QA-16: o texto anterior era uma NOTA DE DESENVOLVEDOR
            ("Em breve — mover o fluxo do Login pra cá"), que não deve chegar ao
            usuário. Mas o `onClick` deste item é um no-op: trocá-lo por um
            subtítulo comum criaria um botão que parece funcional e não faz nada.
            A copy fica voltada ao usuário e continua sinalizando a
            indisponibilidade, até o fluxo de credenciais existir. */}
        <SettingsItemLink
          icon={KeyRound}
          title="Alterar E-mail e Senha"
          subtitle="Disponível em breve"
          onClick={() => {}}
        />
        <SettingsItemLink
          icon={MapPin}
          title="Localização Base"
          subtitle={profile.endereco}
          onClick={() => setModalAberto('localizacao')}
        />
        <SettingsItemLink
          icon={Trash2}
          title="Excluir Conta"
          subtitle="Remover perfil e herbário"
          perigo
          onClick={() => setModalAberto('excluir_conta')}
        />
      </SettingsSection>

      <SettingsSection title="Notificações" icon={Bell}>
        <SettingsItemToggle
          icon={Bell}
          title="Lembretes do Desafio Diário"
          subtitle="Aviso quando o desafio expira"
          checked={preferencias.lembreteDesafioDiario}
          onToggle={(v) => handleToggle('lembreteDesafioDiario', v)}
        />
        <SettingsItemToggle
          icon={HeartHandshake}
          title="Alertas do Mural"
          subtitle="Curtidas e respostas na Comunidade"
          checked={preferencias.alertasMural}
          onToggle={(v) => handleToggle('alertasMural', v)}
        />
        <SettingsItemToggle
          icon={Repeat}
          title="Novas Solicitações de Troca"
          subtitle="Propostas de mudas e sementes"
          checked={preferencias.solicitacoesTroca}
          onToggle={(v) => handleToggle('solicitacoesTroca', v)}
        />
      </SettingsSection>

      <SettingsSection title="Privacidade" icon={ShieldCheck}>
        <SettingsItemToggle
          icon={ShieldCheck}
          title="Herbário Público"
          subtitle="Outros usuários podem ver sua coleção"
          checked={preferencias.herbarioPublico}
          onToggle={(v) => handleToggle('herbarioPublico', v)}
        />
        <SettingsItemToggle
          icon={Repeat}
          title="Disponível para Trocas"
          subtitle="Permitir propostas na Comunidade"
          checked={preferencias.disponivelParaTrocas}
          onToggle={(v) => handleToggle('disponivelParaTrocas', v)}
        />
      </SettingsSection>

      <SettingsSection title="Gerenciamento de Dados" icon={Download}>
        <SettingsItemLink
          icon={Download}
          title="Exportar Meus Dados"
          subtitle="Perfil, progresso, herbário e atividades em JSON"
          onClick={() => setModalAberto('exportar_dados')}
        />
        <SettingsItemLink
          icon={Trash}
          title="Limpar Cache de Imagens"
          onClick={() => setModalAberto('limpar_cache')}
        />
      </SettingsSection>

      <SettingsSection title="Preferências" icon={Palette}>
        <div className="px-4 py-3">
          <label className="text-xs font-bold text-ink-muted block mb-2">Tema Visual</label>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            {TEMAS.map((tema) => (
              <button
                key={tema.id}
                onClick={() => handleUpdateTema(tema.id)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  gameState.tema_ativo === tema.id
                    ? 'bg-green-deep text-white border-green-deep shadow'
                    : 'bg-surface-alt text-ink-muted border-black/[0.04] hover:bg-green-soft'
                }`}
              >
                {tema.nome}
              </button>
            ))}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Sobre" icon={FileText}>
        <SettingsItemLink
          icon={FileText}
          title="Termos de Uso e Privacidade"
          onClick={() => router.push('/termos')}
        />
        <SettingsItemLink
          icon={MessageCircleWarning}
          title="Relatar um Bug/Feedback"
          onClick={() => window.open('mailto:germina@icet.ufam.edu.br?subject=Feedback%20GERMINA', '_blank')}
        />
      </SettingsSection>

      <button
        onClick={handleLogout}
        className="w-full bg-card-bg hover:bg-black/[0.03] text-ink-muted font-bold text-sm px-4 py-3.5 rounded-2xl border border-black/[0.04] shadow-card transition-all flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4 text-ink-muted" />
        <span>Sair / Alternar Conta</span>
      </button>

      {modalAberto === 'editar_perfil' && (
        <EditarPerfilModal
          profile={profile}
          onFechar={() => setModalAberto(null)}
          onSalvar={handleSalvarPerfil}
        />
      )}
      {modalAberto === 'localizacao' && (
        <LocalizacaoModal
          profile={profile}
          onFechar={() => setModalAberto(null)}
          onSalvar={handleSalvarLocalizacao}
        />
      )}
      {modalAberto === 'excluir_conta' && (
        <ExcluirContaModal onFechar={() => setModalAberto(null)} onConfirmar={handleExcluirConta} />
      )}
      {modalAberto === 'exportar_dados' && <ExportarDadosModal onFechar={() => setModalAberto(null)} />}
      {modalAberto === 'limpar_cache' && (
        <LimparCacheModal onFechar={() => setModalAberto(null)} onConfirmar={() => setModalAberto(null)} />
      )}
    </div>
  );
}
