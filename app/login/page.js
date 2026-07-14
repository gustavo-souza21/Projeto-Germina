"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState("entrar"); // "entrar" | "criar"
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Preencha e-mail e senha para continuar.");
      return;
    }

    // TODO: substituir por chamada real ao Supabase Auth
    // const { data, error } = modo === "entrar"
    //   ? await supabase.auth.signInWithPassword({ email, password: senha })
    //   : await supabase.auth.signUp({ email, password: senha });

    router.push("/jardim");
  }

  return (
    <div className="container py-5" style={{ maxWidth: 440 }}>
      <div className="text-center mb-4">
        <div className="fs-1" aria-hidden="true">
          🌿
        </div>
        <h1 className="h3">
          {modo === "entrar" ? "Bem-vindo(a) de volta" : "Crie sua conta"}
        </h1>
        <p style={{ color: "var(--germina-ink-muted)" }}>
          {modo === "entrar"
            ? "Continue sua jornada no Jardim do Conhecimento."
            : "Comece a germinar o seu conhecimento agora."}
        </p>
      </div>

      <div className="card-germina p-4">
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="senha" className="form-label fw-semibold">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            />
          </div>

          {erro && (
            <div className="alert alert-danger py-2 small" role="alert">
              {erro}
            </div>
          )}

          <button type="submit" className="btn-germina w-100 mt-2">
            {modo === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <div className="text-center mt-3">
          <button
            type="button"
            className="btn btn-link small"
            onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")}
          >
            {modo === "entrar"
              ? "Ainda não tem conta? Criar conta"
              : "Já tem conta? Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
