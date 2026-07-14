"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="navbar-germina sticky-top">
      <nav className="container d-flex align-items-center justify-content-between py-3">
        <Link
          href="/"
          className="d-flex align-items-center gap-2 font-display fs-4"
          style={{ color: "var(--germina-green-900)" }}
        >
          <span aria-hidden="true">🌿</span>
          germina
        </Link>

        <div className="d-none d-md-flex align-items-center gap-4">
          <Link href="/herbario" className="text-body fw-medium">
            Biblioteca
          </Link>
          <Link href="/jardim" className="text-body fw-medium">
            Jardim do Conhecimento
          </Link>
          <a href="#comunidade" className="text-body fw-medium">
            Comunidade
          </a>
        </div>

        <Link href="/login" className="btn-germina-outline">
          Entrar
        </Link>
      </nav>
    </header>
  );
}
