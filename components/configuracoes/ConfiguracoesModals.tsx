'use client';

import { useState } from 'react';
import { X, AlertTriangle, Check, Download, Trash2 } from 'lucide-react';
import { Profile } from '../../lib/types';
import { exportarDadosUsuario } from '../../lib/exportarDados';

function ModalShell({
  titulo,
  onFechar,
  children,
}: {
  titulo: string;
  onFechar: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4">
      <div className="w-full sm:max-w-md bg-card-bg rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-green-deep">{titulo}</h3>
          <button onClick={onFechar} className="text-ink-muted hover:text-ink-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputClasses =
  'w-full bg-surface-alt border border-black/10 rounded-xl px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-main';

export function EditarPerfilModal({
  profile,
  onFechar,
  onSalvar,
}: {
  profile: Profile;
  onFechar: () => void;
  onSalvar: (dados: Partial<Profile>) => void;
}) {
  const [nome, setNome] = useState(profile.nome_completo);
  const [instituicao, setInstituicao] = useState(profile.instituicao || '');

  return (
    <ModalShell titulo="Editar Perfil" onFechar={onFechar}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSalvar({ nome_completo: nome, instituicao });
          onFechar();
        }}
        className="space-y-3"
      >
        <div>
          <label className="text-xs font-bold text-ink-muted block mb-1">Nome completo</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputClasses} />
        </div>
        <div>
          <label className="text-xs font-bold text-ink-muted block mb-1">Instituição</label>
          <input
            value={instituicao}
            onChange={(e) => setInstituicao(e.target.value)}
            className={inputClasses}
            placeholder="Opcional"
          />
          {/* Fase 2 (achados #3/#4): o campo continua texto livre, sem
              validação de domínio nem allowlist — o que mudou é que ele
              deixou de ser exibido publicamente, então texto livre parou de
              ser um problema de veracidade. Dizer isso aqui é parte da
              correção: o usuário precisa saber que o que ele digita não é
              conferido por ninguém e não vira credencial no Mural. */}
          <p className="text-[10px] text-ink-muted mt-1 leading-snug">
            Autodeclarada e visível só para você. Não aparece no Mural nem nos seus posts — é usada
            como dado da pesquisa acadêmica do projeto.
          </p>
        </div>
        <button type="submit" className="w-full py-3 rounded-2xl font-bold text-white bg-green-deep hover:bg-green-main">
          Salvar alterações
        </button>
      </form>
    </ModalShell>
  );
}

export function LocalizacaoModal({
  profile,
  onFechar,
  onSalvar,
}: {
  profile: Profile;
  onFechar: () => void;
  onSalvar: (endereco: string) => void;
}) {
  const [endereco, setEndereco] = useState(profile.endereco ?? '');

  return (
    <ModalShell titulo="Localização Base" onFechar={onFechar}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSalvar(endereco);
          onFechar();
        }}
        className="space-y-3"
      >
        <div>
          <label className="text-xs font-bold text-ink-muted block mb-1">Bairro / Cidade</label>
          <input value={endereco} onChange={(e) => setEndereco(e.target.value)} className={inputClasses} />
        </div>
        <button type="submit" className="w-full py-3 rounded-2xl font-bold text-white bg-green-deep hover:bg-green-main">
          Salvar localização
        </button>
      </form>
    </ModalShell>
  );
}

export function ExcluirContaModal({
  onFechar,
  onConfirmar,
}: {
  onFechar: () => void;
  /** Rejeita a promise em caso de falha — usado aqui só para reabilitar o botão. */
  onConfirmar: () => Promise<void>;
}) {
  const [confirmacao, setConfirmacao] = useState('');
  const [excluindo, setExcluindo] = useState(false);

  return (
    <ModalShell titulo="Excluir Conta" onFechar={onFechar}>
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 mb-4">
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
        <p className="text-xs text-red-900 leading-relaxed">
          Essa ação é <strong>permanente</strong>. Seu perfil, herbário pessoal, conquistas e histórico serão
          removidos e não podem ser recuperados.
        </p>
      </div>

      <label className="text-xs font-bold text-ink-muted block mb-1">
        Digite <strong>EXCLUIR</strong> para confirmar
      </label>
      <input
        value={confirmacao}
        onChange={(e) => setConfirmacao(e.target.value)}
        className={inputClasses}
        placeholder="EXCLUIR"
      />

      <button
        disabled={confirmacao !== 'EXCLUIR' || excluindo}
        onClick={async () => {
          setExcluindo(true);
          try {
            await onConfirmar();
            // Sucesso navega pra fora desta tela (ver handleExcluirConta) —
            // não há necessidade de setExcluindo(false) aqui; se o
            // componente ainda estiver montado quando a promise resolver,
            // o catch abaixo simplesmente não executa.
          } catch {
            // Erro já foi logado/avisado por quem implementa onConfirmar
            // (ConfiguracoesClient). Aqui só reabilita o botão pra permitir
            // nova tentativa.
            setExcluindo(false);
          }
        }}
        className="w-full mt-3 py-3 rounded-2xl font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 flex items-center justify-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        {excluindo ? 'Excluindo...' : 'Excluir minha conta permanentemente'}
      </button>
    </ModalShell>
  );
}

export function ExportarDadosModal({ onFechar }: { onFechar: () => void }) {
  const [exportando, setExportando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleExportar = async () => {
    setExportando(true);
    setErro(null);

    try {
      await exportarDadosUsuario();
      setConcluido(true);
    } catch (err) {
      console.error('Falha ao exportar dados:', err);
      setErro('Não foi possível exportar seus dados agora. Tente novamente.');
    } finally {
      setExportando(false);
    }
  };

  return (
    // Título/copy ajustados de propósito: o gatilho original ("Exportar Meu
    // Herbário" / "Fichas taxonômicas em PDF ou CSV", ver ConfiguracoesClient)
    // prometia um formato e um recorte de dados que a implementação real não
    // entrega — o export cobre a conta inteira (perfil, progresso, herbário,
    // atividades e desafios concluídos), sempre em JSON. Mesmo raciocínio do
    // QA-03: o texto que a pessoa lê tem que ser o que ela recebe.
    <ModalShell titulo="Exportar Meus Dados" onFechar={onFechar}>
      {!concluido ? (
        <div className="space-y-4">
          <p className="text-xs text-ink-muted">
            Gera um arquivo <strong>.json</strong> com seus dados salvos no GERMINA: perfil, progresso (XP, moedas,
            sementes, adubo), herbário, histórico de atividades e desafios diários concluídos.
          </p>
          {erro && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-900 leading-relaxed">{erro}</p>
            </div>
          )}
          <button
            onClick={handleExportar}
            disabled={exportando}
            className="w-full py-3 rounded-2xl font-bold text-white bg-green-deep hover:bg-green-main flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {exportando ? 'Gerando arquivo...' : 'Exportar meus dados (.json)'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check className="w-7 h-7 text-emerald-600" />
          </div>
          <p className="text-xs text-ink-muted">Arquivo JSON gerado e baixado com sucesso.</p>
          <button onClick={onFechar} className="w-full py-3 rounded-2xl font-bold text-white bg-green-deep hover:bg-green-main">
            Fechar
          </button>
        </div>
      )}
    </ModalShell>
  );
}

export function LimparCacheModal({ onFechar, onConfirmar }: { onFechar: () => void; onConfirmar: () => void }) {
  const [limpando, setLimpando] = useState(false);

  return (
    <ModalShell titulo="Limpar Cache de Imagens" onFechar={onFechar}>
      <p className="text-xs text-ink-muted mb-4">
        Remove as imagens das plantas guardadas localmente para exibição offline. Elas serão baixadas novamente
        na próxima vez que você visitar cada ficha.
      </p>
      <button
        onClick={() => {
          setLimpando(true);
          setTimeout(onConfirmar, 500);
        }}
        disabled={limpando}
        className="w-full py-3 rounded-2xl font-bold text-white bg-green-deep hover:bg-green-main disabled:opacity-60"
      >
        {limpando ? 'Limpando...' : 'Limpar cache agora'}
      </button>
    </ModalShell>
  );
}
