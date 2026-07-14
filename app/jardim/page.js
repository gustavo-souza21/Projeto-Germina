import BarraXP from "@/components/BarraXP";
import { usuarioMock, niveis } from "@/data/plantas";

export default function JardimPage() {
  const u = usuarioMock;

  const desafiosDoDia = [
    {
      titulo: "Identifique 3 propriedades da Camomila",
      recompensa: "+50 XP",
      concluido: false,
    },
    {
      titulo: "Estude 2 novas plantas da biblioteca",
      recompensa: "+40 XP",
      concluido: true,
    },
    {
      titulo: "Compartilhe uma curiosidade na comunidade",
      recompensa: "+30 XP",
      concluido: false,
    },
  ];

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Olá, {u.nome} 🌱</h1>

      <div className="row g-4">
        {/* Coluna principal */}
        <div className="col-lg-8">
          {/* Card de nível/progresso */}
          <div
            className="card-germina p-4 mb-4"
            style={{
              background:
                "linear-gradient(135deg, var(--germina-green-900), var(--germina-blue-700))",
              color: "#fff",
            }}
          >
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <small style={{ opacity: 0.8 }}>Nível {u.nivel}</small>
                <h2 className="h4 mb-0" style={{ color: "#fff" }}>
                  {u.nomeNivel}
                </h2>
              </div>
              <span style={{ fontSize: "2rem" }} aria-hidden="true">
                🌳
              </span>
            </div>
            <div className="mt-3">
              <BarraXP xpAtual={u.xpAtual} xpProximoNivel={u.xpProximoNivel} />
            </div>
          </div>

          {/* Estatísticas rápidas */}
          <div className="row g-3 mb-4">
            {[
              ["🌰", u.sementes, "Sementes"],
              ["🌾", u.adubo, "Adubo"],
              ["🪙", u.moedas, "Moedas"],
              ["📗", u.plantasEstudadas, "Plantas estudadas"],
            ].map(([icone, valor, label]) => (
              <div className="col-6 col-md-3" key={label}>
                <div className="card-germina p-3 text-center h-100">
                  <div className="fs-4" aria-hidden="true">
                    {icone}
                  </div>
                  <p className="fw-bold fs-5 mb-0">{valor}</p>
                  <small style={{ color: "var(--germina-ink-muted)" }}>
                    {label}
                  </small>
                </div>
              </div>
            ))}
          </div>

          {/* Desafios diários */}
          <div className="card-germina p-4">
            <h2 className="h5 mb-3">Desafios de hoje</h2>
            <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
              {desafiosDoDia.map((d) => (
                <li
                  key={d.titulo}
                  className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3"
                  style={{ borderBottom: "1px solid var(--germina-border)" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span aria-hidden="true">{d.concluido ? "✅" : "⬜"}</span>
                    <span
                      style={
                        d.concluido
                          ? { textDecoration: "line-through", color: "var(--germina-ink-muted)" }
                          : undefined
                      }
                    >
                      {d.titulo}
                    </span>
                  </div>
                  <span className="badge-xp">{d.recompensa}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Coluna lateral: trilha de níveis */}
        <div className="col-lg-4">
          <div className="card-germina p-4">
            <h2 className="h5 mb-3">Sua jornada</h2>
            <ol className="list-unstyled d-flex flex-column gap-3 mb-0">
              {niveis.map((n) => {
                const atingido = n.nivel <= u.nivel;
                const atual = n.nivel === u.nivel;
                return (
                  <li key={n.nivel} className="d-flex align-items-center gap-3">
                    <span
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: 36,
                        height: 36,
                        background: atingido
                          ? "var(--germina-green-100)"
                          : "var(--germina-bg)",
                        border: atual
                          ? "2px solid var(--germina-green-700)"
                          : "1px solid var(--germina-border)",
                      }}
                      aria-hidden="true"
                    >
                      {atingido ? n.icone : "🔒"}
                    </span>
                    <div>
                      <p
                        className="mb-0 fw-semibold"
                        style={{
                          color: atingido
                            ? "var(--germina-green-900)"
                            : "var(--germina-ink-muted)",
                        }}
                      >
                        Nível {n.nivel} — {n.nome}
                      </p>
                      {atual && (
                        <small style={{ color: "var(--germina-green-700)" }}>
                          Você está aqui
                        </small>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
