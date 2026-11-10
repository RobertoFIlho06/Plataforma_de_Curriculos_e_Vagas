"use client";
import { signOut } from "next-auth/react";
export default function LogoutButton() {
  return <button type="button" onClick={() => signOut({ callbackUrl: "/login" })}
    className="rounded-lg border border-[#dce6de] bg-white px-3 py-2 text-xs font-semibold text-[#52665a] hover:bg-[#f1f6f2]">
    Sair da conta
  </button>;
}
