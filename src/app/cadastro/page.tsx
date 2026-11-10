
"use client";

import {
  useState,
  type FormEvent,
} from "react";

import Link from "next/link";

export default function CadastroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarId, setAvatarId] = useState("avatar-1");

  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();

    setPending(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            avatarId,
          }),
        }
      );

      const result = await response.json();

      setMessage(
        response.ok
          ? "Conta criada. Você já pode entrar."
          : result.error || "Erro ao cadastrar."
      );
    } catch {
      setMessage("Erro de conexão.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto mt-12 max-w-md rounded-2xl border border-[#e2ebe4] bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[#173c2d]">
        Criar conta
      </h1>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-[#173c2d]">
          Escolha seu avatar
        </p>

        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((n) => {
            const id = `avatar-${n}`;

            return (
              <button
                key={n}
                type="button"
                aria-label={`Avatar ${n}`}
                aria-pressed={avatarId === id}
                onClick={() => setAvatarId(id)}
                className={`rounded-full border-2 p-1 transition ${
                  avatarId === id
                    ? "border-[#168466] bg-[#e4f5ed]"
                    : "border-transparent hover:border-[#b4d6c5]"
                }`}
              >
                <img
                  src={`/avatars/${id}.png`}
                  alt={`Opção ${n}`}
                  className="jobtriva-avatar-motion aspect-square w-full rounded-full object-cover"
                />
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Você poderá trocar depois em Minha conta.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="mt-6 space-y-4"
      >
        <label className="block text-sm">
          Nome
          <input
            required
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="mt-1 w-full rounded-lg border p-3"
          />
        </label>

        <label className="block text-sm">
          E-mail
          <input
            required
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="mt-1 w-full rounded-lg border p-3"
          />
        </label>

        <label className="block text-sm">
          Senha (mínimo de 12 caracteres)
          <input
            required
            minLength={12}
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="mt-1 w-full rounded-lg border p-3"
          />
        </label>

        {message && (
          <p role="status" className="text-sm">
            {message}
          </p>
        )}

        <button
          disabled={pending}
          className="w-full rounded-lg bg-[#168466] p-3 font-semibold text-white disabled:opacity-50"
        >
          {pending
            ? "Criando..."
            : "Criar conta"}
        </button>
      </form>

      <Link
        href="/login"
        className="mt-5 block text-sm text-[#168466] underline"
      >
        Já tenho conta
      </Link>
    </section>
  );
}
