import { LucideIcon, ChevronRight } from 'lucide-react';

interface SettingsItemBaseProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

export function SettingsItemLink({
  icon: Icon,
  title,
  subtitle,
  onClick,
  perigo = false,
}: SettingsItemBaseProps & { onClick: () => void; perigo?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-surface-alt ${
        perigo ? 'text-red-600' : 'text-ink-muted'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={`w-4 h-4 ${perigo ? 'text-red-500' : 'text-green-main'}`} />
        <div>
          <span className={`text-xs font-bold block ${perigo ? 'text-red-600' : 'text-green-deep'}`}>{title}</span>
          {subtitle && <span className="text-[10px] text-ink-muted">{subtitle}</span>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-locked" />
    </button>
  );
}

export function SettingsItemToggle({
  icon: Icon,
  title,
  subtitle,
  checked,
  onToggle,
}: SettingsItemBaseProps & { checked: boolean; onToggle: (val: boolean) => void }) {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4 text-green-main" />
        <div>
          <span className="text-xs font-bold text-green-deep block">{title}</span>
          {subtitle && <span className="text-[10px] text-ink-muted">{subtitle}</span>}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onToggle(!checked)}
        className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
          checked ? 'bg-green-main' : 'bg-black/15'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
