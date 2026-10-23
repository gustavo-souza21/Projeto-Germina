'use client';

import { TextoCientifico } from './ui/TextoCientifico';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlantaCatalogo } from '../lib/types';
import { ArrowLeft, Award, ShieldAlert, HeartHandshake, Sparkles, Check, Images, Sprout } from 'lucide-react';
import { ECONOMIA } from '../lib/economia';
import { CreditoFoto } from './CreditoFoto';
import { NomeCientifico } from './ui/NomeCientifico';

/** Em que ponto do estudo (ficha + quiz) o usuário está nesta espécie. */
export type EtapaEstudo = 'nao_iniciado' | 'ficha_lida' | 'concluido';

/** Título de seção da ficha: um só estilo para todas (hierarquia consistente). */
const TITULO_SECAO = 'text-sm sm:text-[15px] font-bold mb-1.5';
/** Texto de conteúdo da ficha: 14px em qualquer tela. */
const TEXTO_SECAO = 'text-sm leading-relaxed';

interface FichaBotanicaPlantaProps {
  planta: PlantaCatalogo;
  etapa: EtapaEstudo;
  /** Sementes desta espécie no inventário (só faz sentido com o estudo concluído). */
  sementes: number;
  /** A revisão desta espécie já rendeu moedas hoje (a conclusão do estudo também conta). */
  revisaoPagaHoje: boolean;
  /** `true` enquanto a leitura da ficha está sendo registrada. */
  salvando?: boolean;
  onAvancar: () => void;
}

export function FichaBotanicaPlanta({
  planta,
  etapa,
  sementes,
  revisaoPagaHoje,
  salvando = false,
  onAvancar,
}: FichaBotanicaPlantaProps) {
  const router = useRouter();

  // Galeria: a curadoria traz 1 a 3 fotos por planta. fotoAtiva controla qual delas
  // aparece no header grande; as miniaturas abaixo trocam a foto em destaque.
  const fotos = planta.imagem_galeria?.length ? planta.imagem_galeria : [planta.imagem_url];
  const [fotoAtiva, setFotoAtiva] = useState(0);

  return (
    <div className="space-y-0 pb-24 md:pb-8 -mx-4 sm:mx-0">
      <div className="bg-card-bg sm:rounded-2xl overflow-hidden shadow-card border-0 sm:border border-black/[0.04]">
        {/* Header com imagem */}
        <div className="relative h-56 sm:h-64 bg-blue-deep">
          <img
            src={fotos[fotoAtiva]}
            alt={planta.nome_popular}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <CreditoFoto fotosFonte={planta.fotos_fonte} tamanho="md" />

          <button
            onClick={() => router.push('/biblioteca')}
            className="absolute top-3 left-3 bg-black/50 text-white rounded-full p-2 hover:bg-black/80 transition-colors flex items-center gap-1.5 pr-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:inline">Biblioteca</span>
          </button>

          <div className="absolute top-3 right-3 flex flex-wrap gap-2 justify-end">
            {planta.is_renisus && (
              <span className="bg-amber-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
                <Award className="w-4 h-4" />
                RENISUS
              </span>
            )}
            <span className="bg-emerald-900/80 text-emerald-200 text-xs px-3 py-1 rounded-full font-bold border border-emerald-500/30">
              {planta.categoria}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold">{planta.nome_popular}</h1>
            <p className="text-sm text-emerald-300 font-serif">
              <NomeCientifico texto={planta.nome_cientifico} />
            </p>
            <p className="text-xs text-emerald-100/70 font-medium">Família {planta.familia}</p>
          </div>
        </div>

        {/* Miniaturas da galeria — só aparece quando a ficha tem mais de 1 foto */}
        {fotos.length > 1 && (
          <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-surface-alt border-b border-black/10 overflow-x-auto">
            <Images className="w-3.5 h-3.5 text-ink-muted shrink-0" />
            {fotos.map((foto, i) => (
              <button
                key={foto}
                onClick={() => setFotoAtiva(i)}
                aria-label={`Ver foto ${i + 1} de ${planta.nome_popular}`}
                aria-current={i === fotoAtiva}
                className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  i === fotoAtiva
                    ? 'border-green-main ring-2 ring-green-main/30'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={foto} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            <span className="text-[11px] text-ink-muted font-medium ml-1 shrink-0">
              {fotoAtiva + 1}/{fotos.length} — fotos da curadoria científica
            </span>
          </div>
        )}

        {/* Conteúdo */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-red-900 leading-relaxed">
              <strong>O conteúdo do GERMINA é educativo e não substitui orientação médica ou farmacêutica.</strong>{' '}
              As plantas medicinais devem ser utilizadas garantindo os efeitos benéficos e evitando que o uso
              incorreto possa causar efeitos indesejáveis e toxicidade (ANVISA, 2010). Não se automedique —
              consulte um profissional de saúde antes de usar qualquer planta com finalidade terapêutica.
            </p>
          </div>

          {/* Hierarquia da ficha (revisão da curadoria, 23/10/2026): nome
              popular é o h1; cada seção é um h2 do MESMO tamanho e peso,
              mudando só a cor da caixa; todo texto de conteúdo em 14px
              (text-sm). Antes havia h4 e h5 misturados e quase todo o texto
              técnico em 12px, pequeno demais para ler no celular. */}
          <section>
            <h2 className={TITULO_SECAO + ' text-green-deep'}>Descrição botânica</h2>
            <p className={TEXTO_SECAO + ' text-ink'}><TextoCientifico texto={planta.descricao} /></p>
          </section>

          <section className="bg-surface-alt p-4 rounded-xl border border-black/[0.04]">
            <h2 className={TITULO_SECAO + ' text-green-deep flex items-center gap-1.5'}>
              <HeartHandshake className="w-4 h-4 text-green-main" aria-hidden />
              <span>Usos tradicionais na Amazônia</span>
            </h2>
            <ul className={TEXTO_SECAO + ' space-y-1 text-ink'}>
              {planta.usos_tradicionais.map((uso, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-main font-bold" aria-hidden>•</span>
                  {/* Itens da lista sempre com inicial maiúscula (a curadoria alterna
                      "Gripe, ..." e "diarreia, ..."); o dado não muda, só a exibição. */}
                  <span><TextoCientifico texto={uso.charAt(0).toUpperCase() + uso.slice(1)} /></span>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <section className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/60">
              <h2 className={TITULO_SECAO + ' text-emerald-900'}>Modo de preparo tradicional</h2>
              <p className={TEXTO_SECAO + ' text-emerald-900/90'}><TextoCientifico texto={planta.preparo} /></p>
            </section>

            <section className="bg-teal-50/60 p-4 rounded-xl border border-teal-200/60">
              <h2 className={TITULO_SECAO + ' text-teal-900'}>Habitat e ocorrência</h2>
              <p className={TEXTO_SECAO + ' text-teal-900/90'}><TextoCientifico texto={planta.habitat} /></p>
            </section>
          </div>

          <section className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h2 className={TITULO_SECAO + ' text-blue-900'}>Composição fitoquímica e evidências</h2>
            <p className={TEXTO_SECAO + ' text-blue-900/90'}><TextoCientifico texto={planta.evidencias} /></p>
          </section>

          <section className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <h2 className={TITULO_SECAO + ' text-amber-900 flex items-center gap-1.5'}>
              <ShieldAlert className="w-4 h-4 text-amber-600" aria-hidden />
              Segurança e precauções
            </h2>
            <p className={TEXTO_SECAO + ' text-amber-900/90'}><TextoCientifico texto={planta.seguranca} /></p>
          </section>

          <section className="bg-red-50 p-4 rounded-xl border border-red-200">
            <h2 className={TITULO_SECAO + ' text-red-900 flex items-center gap-1.5'}>
              <ShieldAlert className="w-4 h-4 text-red-600" aria-hidden />
              Contraindicações
            </h2>
            <p className={TEXTO_SECAO + ' text-red-900/90'}><TextoCientifico texto={planta.contraindicacoes} /></p>
          </section>

          <section className="pt-1">
            <h2 className={TITULO_SECAO + ' text-green-deep'}>Objetivos de Desenvolvimento Sustentável (ODS)</h2>
            <div className="flex gap-1.5 flex-wrap">
              {planta.ods_relacionados.map((ods) => (
                <span key={ods} className="bg-green-deep text-green-soft font-bold text-xs px-2.5 py-1 rounded-md">
                  ODS {ods}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Rodapé de ação — estudo em duas etapas: ficha e quiz (spec 1.1).
            A recompensa é anunciada ANTES da atividade (spec 1.3). */}
        <div className="p-4 bg-surface-alt border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-0">
          <div className="text-xs text-ink-muted space-y-1">
            {etapa === 'concluido' ? (
              <>
                <p className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <Check className="w-4 h-4" aria-hidden />
                  Estudo concluído
                  <span className="text-ink-muted font-medium">
                    · {sementes} {sementes === 1 ? 'semente' : 'sementes'} de {planta.nome_popular}
                  </span>
                </p>
                <p>
                  {revisaoPagaHoje ? (
                    <>A revisão de hoje já foi paga. Amanhã revisar rende <strong className="text-emerald-700">+{ECONOMIA.revisao_moedas} moedas</strong> de novo.</>
                  ) : (
                    <>Revisar hoje com o quiz rende <strong className="text-emerald-700">+{ECONOMIA.revisao_moedas} moedas</strong> (uma vez por dia).</>
                  )}
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-ink">
                  <span className={etapa === 'ficha_lida' ? 'text-emerald-700' : ''}>
                    {etapa === 'ficha_lida' ? '1. Ficha lida' : '1. Ler a ficha'}
                  </span>
                  {'  ·  '}2. Responder o quiz
                </p>
                <p>
                  Ao concluir: <strong className="text-emerald-700">+{planta.xp_recompensa} XP</strong>,{' '}
                  <strong className="text-emerald-700">+{ECONOMIA.estudo_moedas} moedas</strong> e a{' '}
                  <strong className="text-emerald-700">semente de {planta.nome_popular}</strong> para o primeiro plantio gratuito.
                </p>
              </>
            )}
          </div>

          <button
            onClick={onAvancar}
            disabled={salvando}
            className="bg-green-deep hover:bg-green-main text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-60 shrink-0"
          >
            {etapa === 'concluido' ? (
              <Sprout className="w-4 h-4" aria-hidden />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" aria-hidden />
            )}
            <span>
              {salvando
                ? 'Salvando...'
                : etapa === 'nao_iniciado'
                  ? 'Li a ficha, ir para o quiz'
                  : etapa === 'ficha_lida'
                    ? 'Responder o quiz'
                    : 'Revisar com o quiz'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
