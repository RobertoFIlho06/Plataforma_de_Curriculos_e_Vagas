"use client";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
export default function LoginPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError("");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) setError("E-mail ou senha inválidos.");
      else window.location.assign("/");
    } catch { setError("Falha ao conectar. Tente novamente."); }
    finally { setPending(false); }
  }
  return <section className="mx-auto mt-12 max-w-md rounded-2xl border border-[#e2ebe4] bg-white p-8 shadow-sm">
    <h1 className="text-2xl font-bold text-[#173c2d]">Entrar no JobTriva</h1>
    <p className="mt-2 text-sm text-gray-600">Acesso à sua conta profissional.</p>
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm">E-mail<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
      <label className="block text-sm">Senha<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={pending} className="w-full rounded-lg bg-[#168466] p-3 font-semibold text-white disabled:opacity-50">{pending ? "Entrando..." : "Entrar"}</button>
    </form>
    <p className="mt-3 text-center text-xs text-gray-500">Login com Google: disponível após a configuração da versão multiusuário.</p>
    <p className="mt-5 text-sm">Não tem conta? <Link href="/cadastro" className="text-[#168466] underline">Cadastre-se</Link></p>
  </section>;
}
