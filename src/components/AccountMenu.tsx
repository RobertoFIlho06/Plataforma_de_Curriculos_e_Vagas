"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

type Props = {
  name?: string | null;
  email?: string | null;
  avatarId?: string | null;
  avatarUrl?: string | null;
};

const AVATARS = ["avatar-1", "avatar-2", "avatar-3", "avatar-4", "avatar-5"] as const;

export default function AccountMenu({ name, email, avatarId, avatarUrl }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(avatarId || "avatar-1");
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setSelected(avatarId || "avatar-1");
  }, [avatarId]);

  async function changeAvatar(next: string) {
    if (saving || avatarUrl || next === selected) return;
    setSaving(true);
    setFeedback("");
    setError(false);
    try {
      const response = await fetch("/api/account/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarId: next }),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar o avatar.");
      setSelected(next);
      setFeedback("Avatar salvo com sucesso!");
    } catch (err) {
      setError(true);
      setFeedback(err instanceof Error ? err.message : "Erro ao salvar avatar.");
    } finally {
      setSaving(false);
    }
  }

  if (pathname === "/login" || pathname === "/cadastro") return null;

  if (!email) {
    return (
      <div className="mb-3 flex justify-end gap-2">
        <Link href="/login" className="rounded-xl border border-[#dce6de] bg-white px-4 py-2 text-sm font-semibold text-[#173c2d]">Entrar</Link>
        <Link href="/cadastro" className="rounded-xl bg-[#168466] px-4 py-2 text-sm font-semibold text-white">Criar conta</Link>
      </div>
    );
  }

  return (
    <div className="mb-3 flex justify-end">
      <div className="relative">
        <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-xl border border-[#dce6de] bg-white px-3 py-2 text-sm font-semibold text-[#173c2d] shadow-sm">
          <span className="jobtriva-avatar-frame h-8 w-8">
            <img src={avatarUrl || `/avatars/${selected}.png`} alt="Seu avatar" className="jobtriva-avatar-image" />
          </span>
          <span>Minha conta</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 text-[#587469] transition-transform duration-200 ease-in-out ${open ? "rotate-180" : "rotate-0"}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-[#dce6de] bg-white p-2 shadow-xl">
            <div className="border-b border-[#e7eee9] px-3 py-3">
              <p className="truncate text-sm font-bold text-[#173c2d]">{name || "Minha conta"}</p>
              <p className="truncate text-xs text-[#718178]">{email}</p>
            </div>
            {!avatarUrl ? (
              <div className="px-3 py-3">
                <p className="mb-3 text-xs font-semibold text-[#173c2d]">Alterar avatar</p>
                <div className="flex items-center justify-between gap-2">
                  {AVATARS.map((id, index) => (
                    <button key={id} type="button" disabled={saving} aria-label={`Escolher avatar ${index + 1}`} aria-pressed={selected === id} onClick={() => changeAvatar(id)} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 p-0.5 transition ${selected === id ? "border-[#168466]" : "border-transparent hover:border-[#b4d6c5]"} disabled:opacity-60`}>
                      <span className="jobtriva-avatar-frame h-full w-full">
                        <img src={`/avatars/${id}.png`} alt="" className="jobtriva-avatar-image" />
                      </span>
                    </button>
                  ))}
                </div>
                {feedback && <p role="status" className={`mt-3 text-xs ${error ? "text-red-600" : "text-[#168466]"}`}>{feedback}</p>}
              </div>
            ) : (
              <p className="px-3 py-3 text-xs text-gray-500">Foto vinculada à conta Google.</p>
            )}
            <Link href="/perfil" onClick={() => setOpen(false)} className="mt-2 block rounded-lg px-3 py-2 text-sm text-[#243e30] hover:bg-[#f1f6f2]">Meu perfil</Link>
            <button type="button" disabled={leaving} onClick={async () => { setLeaving(true); try { await signOut({ callbackUrl: "/login" }); } finally { setLeaving(false); } }} className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">{leaving ? "Saindo..." : "Sair da conta"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
