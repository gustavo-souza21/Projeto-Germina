'use client';

import { BookMarked, Award, Activity, Settings } from 'lucide-react';

export type PerfilTabKey = 'herbario' | 'conquistas' | 'atividade' | 'conta';

const TABS: { key: PerfilTabKey; label: string; icon: typeof BookMarked }[] = [
  { key: 'herbario', label: 'Herbário', icon: BookMarked },
  { key: 'conquistas', label: 'Conquistas', icon: Award },
  { key: 'atividade', label: 'Atividade', icon: Activity },
  { key: 'conta', label: 'Conta', icon: Settings },
];

export function ProfileTabs({
  activeTab,
  onChangeTab,
}: {
  activeTab: PerfilTabKey;
  onChangeTab: (tab: PerfilTabKey) => void;
}) {
  return (
    <div className="bg-card-bg p-1.5 rounded-2xl border border-black/[0.04] flex gap-1 shadow-card">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChangeTab(key)}
          className={`flex-1 py-2 px-2 pointer-coarse:min-h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === key
              ? 'bg-green-deep text-white shadow'
              : 'text-ink-muted hover:bg-surface-alt'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
