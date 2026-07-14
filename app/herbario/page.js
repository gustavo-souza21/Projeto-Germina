import HerbarioGrid from "@/components/HerbarioGrid";
import { plantas } from "@/data/plantas";

export const metadata = {
  title: "Biblioteca de Plantas — GERMINA",
};

export default function HerbarioPage() {
  return (
    <div className="container py-4">
      <h1 className="h3 mb-1">Biblioteca de Plantas Medicinais</h1>
      <p className="mb-4" style={{ color: "var(--germina-ink-muted)" }}>
        As 15 espécies do Horto Municipal de Itacoatiara/AM. Estude cada
        planta para desbloquear XP, sementes e novas cartas para o seu
        herbário.
      </p>
      <HerbarioGrid plantas={plantas} />
    </div>
  );
}
