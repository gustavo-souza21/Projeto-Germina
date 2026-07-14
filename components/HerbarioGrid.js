"use client";

import { useMemo, useState } from "react";

export default function HerbarioGrid({ plantas }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos"); // todos | rara | comum
  const [selecionada, setSelecionada] = useState(null);

  const filtradas = useMemo(() => {
    return plantas.filter((p) => {
      const bateBusca =
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.usos.some((u) => u.toLowerCase().includes(busca.toLowerCase()));
      const bateFiltro = filtro === "todos" || p.raridade === filtro;
      return bateBusca && bateFiltro;
    });
  }, [plantas, busca, filtro]);

  return (
    <div>
      <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
        <input
          type="search"
          className="form-control"
          style={{ maxWidth: 320 }}
          placeholder="Buscar plantas, propriedades..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar plantas"
        />
        <div className="btn-group" role="group" aria-label="Filtrar por raridade">
          {[
            ["todos", "Todas"],
            ["rara", "★ RENISUS"],
            ["comum", "Comuns"],
          ].map(([valor, label]) => (
            <button
              key={valor}
              type="button"
              className={
                filtro === valor
                  ? "btn btn-germina"
                  : "btn btn-germina-outline"
              }
              onClick={() => setFiltro(valor)}
            >
              {label}
            </button>
          ))}
        </div>
        <small className="ms-auto" style={{ color: "var(--germina-ink-muted)" }}>
          {filtradas.length} {filtradas.length === 1 ? "espécie" : "espécies"}
        </small>
      </div>

      <div className="row g-3">
        {filtradas.map((p) => (
          <div className="col-6 col-md-4 col-lg-3" key={p.id}>
            <button
              type="button"
              className="card-germina h-100 p-3 text-start w-100 border-0"
              onClick={() => setSelecionada(p)}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="fs-1" aria-hidden="true">
                  {p.imagem}
                </div>
                <span className="badge-xp">+{p.xp} XP</span>
              </div>
              <p className="fw-semibold mb-0 mt-2">{p.nome}</p>
              <small
                className="d-block mb-2"
                style={{ color: "var(--germina-ink-muted)", fontStyle: "italic" }}
              >
                {p.nomeCientifico}
              </small>
              {p.raridade === "rara" && (
                <small className="raridade-rara">★ Espécie RENISUS</small>
              )}
            </button>
          </div>
        ))}

        {filtradas.length === 0 && (
          <div className="col-12">
            <div className="card-germina p-4 text-center">
              <p className="mb-0">
                Nenhuma planta encontrada para &quot;{busca}&quot;. Tente
                buscar por outro nome ou propriedade.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal simples de detalhe da carta */}
      {selecionada && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Detalhes de ${selecionada.nome}`}
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: "rgba(15, 61, 46, 0.45)", zIndex: 1050 }}
          onClick={() => setSelecionada(null)}
        >
          <div
            className="card-germina p-4"
            style={{ maxWidth: 420, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div className="fs-1" aria-hidden="true">
                {selecionada.imagem}
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Fechar"
                onClick={() => setSelecionada(null)}
              />
            </div>
            <h2 className="h4 mt-2 mb-0">{selecionada.nome}</h2>
            <p style={{ color: "var(--germina-ink-muted)", fontStyle: "italic" }}>
              {selecionada.nomeCientifico}
            </p>
            <p>{selecionada.descricao}</p>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {selecionada.usos.map((u) => (
                <span
                  key={u}
                  className="badge rounded-pill"
                  style={{
                    background: "var(--germina-green-100)",
                    color: "var(--germina-green-900)",
                  }}
                >
                  {u}
                </span>
              ))}
            </div>
            <div className="d-flex justify-content-between align-items-center">
              {selecionada.raridade === "rara" && (
                <small className="raridade-rara">★ Espécie RENISUS</small>
              )}
              <span className="badge-xp">+{selecionada.xp} XP ao estudar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
