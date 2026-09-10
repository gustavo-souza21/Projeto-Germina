import { Check, X } from 'lucide-react';

interface AnswerOptionProps {
  keyLetter: 'A' | 'B' | 'C' | 'D';
  optionText: string;
  isSelected: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  isDisabled: boolean;
  onSelect: (letter: 'A' | 'B' | 'C' | 'D') => void;
}

export function AnswerOption({
  keyLetter,
  optionText,
  isSelected,
  isCorrect,
  isIncorrect,
  isDisabled,
  onSelect,
}: AnswerOptionProps) {
  let containerStyle = 'bg-card-bg border-2 border-black/[0.08] hover:border-blue-main/40 text-blue-deep';
  let badgeStyle = 'bg-surface-alt text-green-deep border-black/[0.08]';
  let icon = null;

  if (isCorrect) {
    containerStyle = 'bg-green-soft/40 border-2 border-green-main text-green-deep font-bold';
    badgeStyle = 'bg-green-main text-white border-green-main';
    icon = <Check className="w-4 h-4 text-green-main ml-auto shrink-0 stroke-[3]" />;
  } else if (isIncorrect) {
    containerStyle = 'bg-rose-50 border-2 border-rose-400 text-rose-950 font-bold';
    badgeStyle = 'bg-rose-500 text-white border-rose-500';
    icon = <X className="w-4 h-4 text-rose-600 ml-auto shrink-0 stroke-[3]" />;
  } else if (isSelected) {
    containerStyle = 'bg-blue-main/10 border-2 border-blue-main text-blue-deep font-bold';
    badgeStyle = 'bg-blue-main text-white border-blue-main';
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(keyLetter)}
      disabled={isDisabled}
      aria-pressed={isSelected}
      className={`w-full min-h-[56px] p-4 rounded-xl border-2 flex items-center gap-3 text-left transition-all duration-150 disabled:cursor-default ${containerStyle}`}
    >
      <span className={`w-8 h-8 rounded-lg font-bold text-sm flex items-center justify-center shrink-0 border transition-colors ${badgeStyle}`}>
        {keyLetter}
      </span>
      <span className="text-sm leading-snug flex-1">{optionText}</span>
      {icon}
    </button>
  );
}
