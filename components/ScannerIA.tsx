'use client';

import React, { useState } from 'react';
import { Camera, Upload, Sparkles, CheckCircle2, ShieldAlert, BookOpen, AlertTriangle, RefreshCw, Award } from 'lucide-react';
import { NomeCientifico } from './ui/NomeCientifico';

export interface ScannerIAResult {
  nome_popular: string;
  nome_cientifico: string;
  confianca: number;
  descricao: string;
  usos_tradicionais: string[];
  preparo: string;
  seguranca: string;
  ods_relacionados: number[];
  is_renisus: boolean;
  xp_recompensa: number;
}

interface ScannerIAProps {
  onEstudarScan: (scanData: ScannerIAResult) => void;
}

export const ScannerIA: React.FC<ScannerIAProps> = ({ onEstudarScan }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [descriptionInput, setDescriptionInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScannerIAResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultadoSalvo, setResultadoSalvo] = useState(false);

  // Pre-configured Amazonian sample leaf images for instant testing
  const amostrasAmazonia = [
    {
      nome: 'Folha de Crajiru (Pariri)',
      url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
      desc: 'Folha alongada com tom esverdeado forte que adquire tom avermelhado quando seca.'
    },
    {
      nome: 'Folha de Boldo da Terra',
      url: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?auto=format&fit=crop&w=600&q=80',
      desc: 'Folha espessa, pilosa e com aroma amargo penetrante ao macerar.'
    },
    {
      nome: 'Folha de Amora',
      url: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=600&q=80',
      desc: 'Folha denteada levemente áspera de cor verde escura.'
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setScanResult(null);
        setErrorMessage(null);
        setResultadoSalvo(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const executePlantScan = async (sampleImg?: string, sampleDesc?: string) => {
    const imageToUse = sampleImg || selectedImage;
    const descToUse = sampleDesc || descriptionInput;

    if (!imageToUse && !descToUse.trim()) {
      setErrorMessage('Por favor, envie uma foto ou digite a descrição da folha/planta para escanear.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setScanResult(null);
    setResultadoSalvo(false);

    try {
      const response = await fetch('/api/scan-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageToUse,
          description: descToUse,
        }),
      });

      const json = await response.json();

      if (json.data) {
        setScanResult(json.data);
      } else {
        throw new Error(json.error || 'Não foi possível analisar a planta.');
      }
    } catch (err: any) {
      console.error('Erro no Scanner IA:', err);
      // Antes: em caso de erro, a tela fingia um resultado fixo (Crajiru) como se fosse
      // a IA analisando a foto do usuário — isso é enganoso. Agora mostra o erro de verdade.
      setErrorMessage(
        'Não foi possível analisar a planta agora. Verifique sua conexão e tente novamente, ou tente com outra foto/descrição.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Banner */}
      <div className="bg-[#16283f] text-white rounded-2xl p-5 shadow-sm border border-[#24506e]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          <h2 className="text-xl font-black">Scanner da Natureza (IA Diagnóstico Inteligente)</h2>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Tire uma foto ou selecione uma imagem da folha para identificação botânica com inteligência artificial e alinhamento aos ODS.
        </p>
      </div>

      {/* Capture Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Box */}
        <div className="bg-card-bg rounded-2xl p-5 border border-green-muted/30 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#2f4d38] flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[#4d7a52]" />
            <span>Módulo de Captura Botânica</span>
          </h3>

          {/* Image Display / Dropzone */}
          <div className="relative h-52 bg-[#f3f6f0] rounded-xl border-2 border-dashed border-green-muted/60 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
            {selectedImage ? (
              <>
                <img
                  src={selectedImage}
                  alt="Planta capturada"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full px-2 py-1 text-[10px] font-bold"
                >
                  Trocar foto
                </button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-[#4d7a52] mb-2 animate-bounce" />
                <span className="text-xs font-bold text-[#2f4d38]">Clique ou arraste uma imagem aqui</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Suporta JPG, PNG, WEBP de câmeras ou galerias</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Description Option */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Ou descreva as características da planta (opcional):
            </label>
            <textarea
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="Ex: Folha grande e pilosa com cheiro forte de menta/hortelã usada para dor de garganta..."
              rows={2}
              className="w-full bg-[#f3f6f0] border border-green-muted/40 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4d7a52]"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            onClick={() => executePlantScan()}
            disabled={isLoading}
            className="w-full bg-[#2f4d38] hover:bg-[#4d7a52] text-white font-extrabold text-sm py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processando IA Botânica...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Analisar Espécie com IA</span>
              </>
            )}
          </button>
        </div>

        {/* Sample Leaves Box */}
        <div className="bg-card-bg rounded-2xl p-5 border border-green-muted/30 shadow-sm space-y-3">
          <h3 className="text-sm font-extrabold text-[#2f4d38]">
            Ou escolha uma amostra da Amazônia para teste rápido:
          </h3>

          <div className="space-y-2.5">
            {amostrasAmazonia.map((amostra, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedImage(amostra.url);
                  setDescriptionInput(amostra.desc);
                  executePlantScan(amostra.url, amostra.desc);
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-green-muted/30 hover:border-[#4d7a52] bg-[#f3f6f0]/50 cursor-pointer transition-all hover:bg-[#f3f6f0]"
              >
                <img
                  src={amostra.url}
                  alt={amostra.nome}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-[#2f4d38]">{amostra.nome}</h4>
                  <p className="text-[11px] text-ink-muted line-clamp-1">{amostra.desc}</p>
                </div>
                <span className="text-xs text-[#24506e] font-extrabold px-2 py-1 bg-card-bg rounded-lg border border-slate-200">
                  Escanear
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Identification Results */}
      {scanResult && (
        <div className="bg-card-bg rounded-2xl p-5 sm:p-6 border-2 border-emerald-500/50 shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                  Identificado pela IA
                </span>
                <span className="text-xs font-extrabold text-emerald-800">
                  {scanResult.confianca}% de Confiança Botânica
                </span>
              </div>

              <h3 className="text-2xl font-black text-[#2f4d38] mt-1">
                {scanResult.nome_popular}
              </h3>
              <p className="text-xs text-emerald-700 font-serif">
                <NomeCientifico texto={scanResult.nome_cientifico} />
              </p>
            </div>

            <div className="flex items-center gap-2">
              {scanResult.is_renisus && (
                <span className="bg-amber-500 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Planta RENISUS (100 XP)
                </span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {scanResult.descricao}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Usos Tradicionais */}
            <div className="bg-[#f3f6f0] p-3.5 rounded-xl border border-green-muted/30">
              <h4 className="font-extrabold text-[#2f4d38] mb-1">Propriedades & Usos Tradicionais</h4>
              <ul className="space-y-1 text-slate-700">
                {scanResult.usos_tradicionais.map((u, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#4d7a52] font-bold">•</span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modo de Preparo */}
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
              <h4 className="font-extrabold text-emerald-900 mb-1">Modo de Preparo Tradicional</h4>
              <p className="text-emerald-800 leading-relaxed">{scanResult.preparo}</p>
            </div>
          </div>

          {/* Segurança & ODS */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink-muted">Selos ODS Alinhados:</span>
              <div className="flex gap-1">
                {scanResult.ods_relacionados.map((ods) => (
                  <span key={ods} className="bg-[#2f4d38] text-emerald-200 font-extrabold text-[10px] px-2 py-0.5 rounded">
                    ODS {ods}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (resultadoSalvo) return;
                onEstudarScan(scanResult);
                setResultadoSalvo(true);
              }}
              disabled={resultadoSalvo}
              className="w-full sm:w-auto bg-[#2f4d38] hover:bg-[#4d7a52] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-default disabled:hover:bg-[#2f4d38]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>
                {resultadoSalvo
                  ? 'Já salvo no seu Herbário ✓'
                  : `Salvar no Meu Herbário (+${scanResult.xp_recompensa} XP)`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
