export default function BarraXP({ xpAtual, xpProximoNivel }) {
  const percentual = Math.min(
    100,
    Math.round((xpAtual / xpProximoNivel) * 100)
  );

  return (
    <div>
      <div className="progress-germina" role="progressbar" aria-valuenow={percentual} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${percentual}%` }} />
      </div>
      <div className="d-flex justify-content-between mt-1">
        <small style={{ color: "var(--germina-ink-muted)" }}>
          {xpAtual} / {xpProximoNivel} XP
        </small>
        <small className="fw-semibold" style={{ color: "var(--germina-green-700)" }}>
          {percentual}%
        </small>
      </div>
    </div>
  );
}
