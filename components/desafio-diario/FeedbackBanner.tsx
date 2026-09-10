interface FeedbackBannerProps {
  isCorrect: boolean;
  respostaCorreta: string;
  feedbackText: string;
  onNext: () => void;
  isLastQuestion: boolean;
}

export function FeedbackBanner({
  isCorrect,
  respostaCorreta,
  feedbackText,
  onNext,
  isLastQuestion,
}: FeedbackBannerProps) {
  return (
    <div className="w-full rounded-2xl border border-black/[0.08] bg-card-bg overflow-hidden">
      {/* QA-09 — colisão semântica resolvida.
          O cabeçalho de resposta incorreta usava `bg-blue-main`, que depois do
          GER-UI-06 passou a ser a cor de AÇÃO PRIMÁRIA. Um banner de feedback
          com a mesma cor do botão "avançar" sugere clique onde não há clique.
          Trocado por `bg-blue-deep`: mesma família, tom mais profundo, sem
          competir com nenhum controle. Contraste com texto branco sobe de
          14,45:1 para 17,4:1. */}
      <div className={`p-5 text-center text-white ${isCorrect ? 'bg-green-main' : 'bg-blue-deep'}`}>
        <div className="text-4xl mb-1">{isCorrect ? '✅' : '💡'}</div>
        <h4 className="text-xl font-bold tracking-tight">
          {isCorrect ? 'Resposta Correta!' : `A resposta certa é a alternativa ${respostaCorreta}`}
        </h4>
      </div>

      <div className="p-5 space-y-4">
        <div className="bg-surface-alt p-4 rounded-xl border border-black/[0.06] italic text-sm leading-relaxed text-ink">
          <span className={`font-bold block mb-1 not-italic underline ${isCorrect ? 'text-green-deep' : 'text-blue-main'}`}>
            Por que {isCorrect ? 'está certo' : 'é essa opção'}?
          </span>
          {feedbackText}
        </div>

        <div className={`flex justify-between items-center p-3 rounded-lg border text-xs font-bold ${
          isCorrect
            ? 'bg-green-soft/40 border-green-soft text-green-deep'
            : 'bg-blue-main/10 border-blue-main/25 text-blue-deep'
        }`}>
          <span>Você ganhou:</span>
          <span className="text-sm font-bold">{isCorrect ? '+10 pts (+50 XP)' : '+5 pts aprendizado'}</span>
        </div>

        {/* GER-UI-06: ação que AVANÇA UM FLUXO usa o azul primário. O verde
            fica reservado a natureza e confirmação de sucesso. */}
        <button
          onClick={onNext}
          className="w-full py-3.5 bg-blue-main hover:bg-blue-deep text-white rounded-xl font-bold transition-colors active:scale-[0.98]"
        >
          {isLastQuestion ? 'VER RESULTADO FINAL 🏆' : 'PRÓXIMA PERGUNTA ➔'}
        </button>
      </div>
    </div>
  );
}
