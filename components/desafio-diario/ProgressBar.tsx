interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between items-center text-xs font-bold text-ink-muted">
        <span className="flex items-center gap-1.5 text-green-deep">
          <span className="w-2 h-2 rounded-full bg-green-main inline-block animate-pulse" />
          Pergunta <strong className="text-green-deep">{currentStep}</strong> de {totalSteps}
        </span>
        <span className="text-ink-muted font-bold">{currentStep}/{totalSteps}</span>
      </div>
      {/* GER-UI-11: progresso é verde em todo o app (BarraXP, missões do
          Jardim, conquistas). O azul aqui destoava do sistema. */}
      <div className="w-full h-2.5 bg-black/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-green-main rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
