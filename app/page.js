import Link from "next/link";
import { plantas } from "@/data/plantas";

export default function Home() {
  const destaques = plantas.slice(0, 5);

  return (
    <div>
      {/* Hero */}
      <section className="container py-5">
        <div className="row align-items-center gy-4 py-4">
          <div className="col-lg-7">
            <h1 className="display-4 mb-3">
              Germinar conhecimento sobre{" "}
              <span style={{ color: "var(--germina-green-500)" }}>
                plantas medicinais
              </span>{" "}
              usando tecnologia.
            </h1>
            <p className="fs-5 mb-4" style={{ color: "var(--germina-ink-muted)" }}>
              O GERMINA transforma o conhecimento tradicional do Horto
              Municipal de Itacoatiara/AM em uma jornada gamificada: estude
              plantas, monte seu herbário digital e cultive o seu próprio
              Jardim do Conhecimento.
            </p>
            <div className="d-flex gap-3 flex-wrap">
              <Link href="/login" className="btn-germina">
                Criar conta
              </Link>
              <Link href="/herbario" className="btn-germina-outline">
                Explorar plantas
              </Link>
            </div>
          </div>
          <div className="col-lg-5">
            <div
              className="card-germina p-4 text-center"
              style={{
                background:
                  "linear-gradient(160deg, var(--germina-green-100), #fff)",
              }}
            >
              <div style={{ fontSize: "4rem" }} aria-hidden="true">
                🌱🌳
              </div>
              <p className="fw-semibold mt-2 mb-0">
                Semente → Broto → Muda → Flores → Árvore → Frutos
              </p>
              <small style={{ color: "var(--germina-ink-muted)" }}>
                Sua jornada de conhecimento, nível por nível.
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="container py-5">
        <h2 className="h3 mb-4">Como o Jardim do Conhecimento funciona</h2>
        <div className="row g-4">
          {[
            {
              icone: "📖",
              titulo: "Estude plantas reais",
              texto:
                "As 15 espécies do Horto de Itacoatiara, com usos tradicionais e evidências científicas.",
            },
            {
              icone: "🌰",
              titulo: "Ganhe XP, sementes e adubo",
              texto:
                "Cada acerto em desafios diários libera recursos para plantar novas mudas.",
            },
            {
              icone: "🗂️",
              titulo: "Monte seu herbário",
              texto:
                "Cada planta estudada vira uma carta digital colecionável no seu herbário pessoal.",
            },
            {
              icone: "🤝",
              titulo: "Conecte-se com a comunidade",
              texto:
                "Troque sementes, participe de desafios e compartilhe descobertas com outros \"frutos\".",
            },
          ].map((item) => (
            <div className="col-md-6 col-lg-3" key={item.titulo}>
              <div className="card-germina h-100 p-4">
                <div className="fs-2 mb-2" aria-hidden="true">
                  {item.icone}
                </div>
                <h3 className="h6">{item.titulo}</h3>
                <p className="small mb-0" style={{ color: "var(--germina-ink-muted)" }}>
                  {item.texto}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Espécies em destaque */}
      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <h2 className="h3 mb-0">Espécies em destaque</h2>
          <Link href="/herbario" className="fw-semibold">
            Ver biblioteca completa →
          </Link>
        </div>
        <div className="row g-3">
          {destaques.map((planta) => (
            <div className="col-6 col-md-4 col-lg-2" key={planta.id}>
              <div className="card-germina h-100 p-3 text-center">
                <div className="fs-1" aria-hidden="true">
                  {planta.imagem}
                </div>
                <p className="fw-semibold small mb-0 mt-1">{planta.nome}</p>
                {planta.raridade === "rara" && (
                  <small className="raridade-rara">★ RENISUS</small>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ODS */}
      <section className="container py-5">
        <h2 className="h3 mb-4">Alinhado aos Objetivos de Desenvolvimento Sustentável</h2>
        <div className="row g-3">
          {[
            ["ODS 3", "Saúde e Bem-estar"],
            ["ODS 4", "Educação de Qualidade"],
            ["ODS 9", "Indústria, Inovação e Infraestrutura"],
            ["ODS 11", "Cidades e Comunidades Sustentáveis"],
            ["ODS 12", "Consumo e Produção Responsáveis"],
            ["ODS 15", "Vida Terrestre"],
          ].map(([codigo, titulo]) => (
            <div className="col-6 col-md-4 col-lg-2" key={codigo}>
              <div
                className="card-germina h-100 p-3 text-center"
                style={{ background: "var(--germina-green-900)", color: "#fff" }}
              >
                <p className="fw-bold mb-1">{codigo}</p>
                <small>{titulo}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
