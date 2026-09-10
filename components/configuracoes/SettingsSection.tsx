import { LucideIcon } from 'lucide-react';

export function SettingsSection({
  title,
  icon: Icon,
  badge,
  children,
}: {
  title: string;
  icon: LucideIcon;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card-bg rounded-2xl border border-black/[0.04] shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-surface-alt flex items-center justify-center">
            <Icon className="w-4 h-4 text-green-deep" />
          </div>
          <h3 className="text-sm font-bold text-green-deep">{title}</h3>
        </div>
        {badge && (
          <span className="text-[10px] font-bold bg-blue-main/10 text-blue-main px-2 py-0.5 rounded-md">
            {badge}
          </span>
        )}
      </div>
      <div className="divide-y divide-black/[0.05]">{children}</div>
    </div>
  );
}
