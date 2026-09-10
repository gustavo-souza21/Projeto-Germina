'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { PlantaCatalogo, UserColecao } from '../lib/types';
import { slugify } from '../lib/slug';
import { Search, Award, BookOpen, BookmarkCheck, Check } from 'lucide-react';
import { CreditoFoto } from './CreditoFoto';
import { NomeCientifico } from './ui/NomeCientifico';

interface HerbarioVirtualProps {
  plantas: PlantaCatalogo[];
  colecaoUsuario: UserColecao[];
}

export const HerbarioVirtual: React.FC<HerbarioVirtualProps> = ({
  plantas,
  colecaoUsuario,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');

  const plantasDesbloqueadasIds = new Set(colecaoUsuario.map(c => c.planta_id));

  /* QA-07 — CATEGORIAS DERIVADAS DO CATÁLOGO
     A lista estava chumbada com 5 categorias, mas o catálogo tem 6. A categoria
     'Geral' não tinha botão, então Amora, Abacate e Cuia-mansa só apareciam em
     "Todas" — três espécies inalcançáveis por filtro.
     Derivando, a lista não pode mais divergir do catálogo: acrescentar uma
     categoria a uma ficha faz o botão aparecer sozinho.
     A contagem por categoria vem junto, o que torna impossível existir um botão
     que não devolve nada. */
  const categorias = useMemo(() => {
    const contagem = new Map<string, number>();
    for (const planta of plantas) {
      contagem.set(planta.categoria, (contagem.get(planta.categoria) ?? 0) + 1);
    }
    return [...contagem.entries()]
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [plantas]);

  // Filter implementation
  const plantasFiltradas = plantas.filter((planta) => {
    const matchesSearch =
      planta.nome_popular.toLowerCase().includes(searchTerm.toLowerCase()) ||
      planta.nome_cientifico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      planta.usos_tradicionais.some(u => u.toLowerCase().includes(searchTerm.toLowerCase())) ||
      planta.categoria.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (categoriaFiltro === 'renisus') return planta.is_renisus;
    if (categoriaFiltro === 'desbloqueadas') return plantasDesbloqueadasIds.has(planta.id);
    if (categoriaFiltro !== 'todos') return planta.categoria.toLowerCase() === categoriaFiltro.toLowerCase();

    return true;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Info */}
      <div className="bg-card-bg rounded-2xl p-5 border border-black/[0.04] shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-green-deep">
              Herbário Digital da Amazônia
            </h2>
            <span className="bg-green-soft text-green-deep font-bold text-xs px-2.5 py-0.5 rounded-full">
              15 Espécies
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Catálogo científico e tradicional. As <strong className="text-amber-700">7 plantas da RENISUS</strong> rendem o <strong className="text-emerald-700">dobro de XP (100 XP)</strong>.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800">
          Estudadas: {plantasDesbloqueadasIds.size} / 15
        </div>
      </div>

      {/* Search Bar & Fast Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-ink-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome popular, científico, sintoma ou uso (ex: Boldo, digestão, febre)..."
            className="w-full bg-card-bg border border-black/10 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-main shadow-sm text-ink"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-ink-muted hover:text-green-deep text-xs"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setCategoriaFiltro('todos')}
            className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-colors ${
              categoriaFiltro === 'todos'
                ? 'bg-green-deep text-white border-green-deep'
                : 'bg-white text-ink-muted border-black/10 hover:bg-black/[0.03]'
            }`}
          >
            Todas ({plantas.length})
          </button>

          <button
            onClick={() => setCategoriaFiltro('renisus')}
            className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-colors flex items-center gap-1 ${
              categoriaFiltro === 'renisus'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Raras RENISUS 2x XP (7)</span>
          </button>

          <button
            onClick={() => setCategoriaFiltro('desbloqueadas')}
            className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-colors flex items-center gap-1 ${
              categoriaFiltro === 'desbloqueadas'
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Colecionadas ({plantasDesbloqueadasIds.size})</span>
          </button>

          {categorias.map((categoria) => (
            <button
              key={categoria.nome}
              onClick={() => setCategoriaFiltro(categoria.nome)}
              className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-colors ${
                categoriaFiltro === categoria.nome
                  ? 'bg-blue-main text-white border-blue-main'
                  : 'bg-white text-ink-muted border-black/10 hover:bg-black/[0.03]'
              }`}
            >
              {categoria.nome} ({categoria.total})
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Digital Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plantasFiltradas.map((planta) => {
          const isColecionada = plantasDesbloqueadasIds.has(planta.id);
          return (
            <Link
              key={planta.id}
              href={`/biblioteca/${slugify(planta.nome_popular)}`}
              className="bg-card-bg rounded-2xl border border-black/[0.04] overflow-hidden shadow-card hover:shadow-card-hover transition-all group flex flex-col justify-between"
            >
              {/* Image & Header */}
              <div className="relative h-44 overflow-hidden bg-surface-alt">
                <img
                  src={planta.imagem_url}
                  alt={planta.nome_popular}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                <CreditoFoto fotosFonte={planta.fotos_fonte} tamanho="sm" />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {planta.is_renisus && (
                    <span className="bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      RENISUS (100 XP)
                    </span>
                  )}
                  <span className="bg-blue-deep/80 backdrop-blur-sm text-green-soft text-[10px] px-2 py-0.5 rounded-md font-semibold">
                    {planta.categoria}
                  </span>
                </div>

                {isColecionada && (
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow">
                    <Check className="w-4 h-4" />
                  </div>
                )}

                <div className="absolute bottom-2 left-3 right-3 text-white">
                  <h3 className="font-bold text-base leading-tight drop-shadow-md">
                    {planta.nome_popular}
                  </h3>
                  <p className="text-xs text-emerald-200 font-serif opacity-90 drop-shadow">
                    <NomeCientifico texto={planta.nome_cientifico} />
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                  {planta.descricao}
                </p>

                {/* Tags de Usos */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {planta.usos_tradicionais.slice(0, 2).map((uso, idx) => (
                    <span
                      key={idx}
                      className="bg-surface-alt text-green-deep text-[10px] px-2 py-0.5 rounded font-medium border border-black/[0.04] truncate max-w-[200px]"
                    >
                      • {uso}
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-black/[0.06] mt-2">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    +{planta.xp_recompensa} XP
                  </span>

                  <span className="text-xs font-bold text-green-deep group-hover:text-green-main flex items-center gap-1">
                    <span>Ver Ficha Botânica</span>
                    <span>&rarr;</span>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {plantasFiltradas.length === 0 && (
        <div className="bg-card-bg rounded-2xl p-8 text-center border border-black/[0.04] shadow-card text-ink-muted space-y-2">
          <BookOpen className="w-10 h-10 mx-auto text-locked" />
          <p className="font-bold">Nenhuma planta encontrada para sua pesquisa.</p>
          <p className="text-xs">Tente buscar por termos genéricos como "boldo", "respiratória" ou "digestiva".</p>
        </div>
      )}
    </div>
  );
};
