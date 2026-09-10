'use client';

import React from 'react';
import { LayoutDashboard, BookOpen, Sprout, Scan, Users, User } from 'lucide-react';

export type NavTab = 'inicio' | 'biblioteca' | 'jardim' | 'scanner' | 'comunidade' | 'perfil';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'inicio' as NavTab, label: 'Início', icon: LayoutDashboard },
    { id: 'biblioteca' as NavTab, label: 'Biblioteca', icon: BookOpen },
    { id: 'jardim' as NavTab, label: 'Jardim', icon: Sprout },
    { id: 'scanner' as NavTab, label: 'IA Scanner', icon: Scan, isHighlight: true },
    { id: 'comunidade' as NavTab, label: 'Comunidade', icon: Users },
    { id: 'perfil' as NavTab, label: 'Perfil', icon: User },
  ];

  return (
    <>
      {/* Mobile Bottom Fixed Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#8fb996]/30 shadow-lg md:hidden">
        <div className="flex items-center justify-around px-1 py-1.5 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center w-full py-1 px-1 rounded-xl transition-all ${
                  item.isHighlight
                    ? isActive
                      ? 'text-white bg-[#2f4d38] font-bold shadow-md scale-105 -translate-y-1'
                      : 'text-emerald-800 bg-[#8fb996]/30 hover:bg-[#8fb996]/50 font-semibold'
                    : isActive
                      ? 'text-[#2f4d38] font-bold bg-[#8fb996]/20'
                      : 'text-slate-500 hover:text-[#2f4d38]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${item.isHighlight && isActive ? 'text-emerald-300' : ''}`} />
                  {item.isHighlight && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#8fb996]/30 min-h-[calc(100vh-65px)] p-4 shadow-sm">
        <div className="mb-6 px-3 py-2 bg-[#f3f6f0] rounded-xl border border-[#8fb996]/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2f4d38] text-emerald-300 flex items-center justify-center font-black text-lg">
              🌱
            </div>
            <div>
              <h1 className="font-extrabold text-[#2f4d38] text-base leading-tight tracking-wide">
                GERMINA
              </h1>
              <p className="text-[11px] text-[#24506e] font-medium leading-none">
                Saberes da Amazônia
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#2f4d38] text-white shadow-md shadow-[#2f4d38]/20 translate-x-1'
                    : 'text-slate-700 hover:bg-[#f3f6f0] hover:text-[#2f4d38]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-300' : 'text-[#4d7a52]'}`} />
                <span>{item.label}</span>
                {item.isHighlight && (
                  <span className="ml-auto text-[10px] bg-[#8fb996]/40 text-[#2f4d38] px-2 py-0.5 rounded-full font-bold">
                    IA
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Institutional & ODS Badge Footer */}
        <div className="pt-4 border-t border-[#8fb996]/30 text-center text-xs text-slate-500">
          <p className="font-bold text-[#2f4d38]">UFAM - Ciências Biológicas</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Projeto Sarah Batista de Freitas</p>
          <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap text-[10px] font-bold text-emerald-800">
            <span className="bg-[#8fb996]/30 px-1.5 py-0.5 rounded">ODS 3</span>
            <span className="bg-[#8fb996]/30 px-1.5 py-0.5 rounded">ODS 4</span>
            <span className="bg-[#8fb996]/30 px-1.5 py-0.5 rounded">ODS 15</span>
          </div>
        </div>
      </aside>
    </>
  );
};
