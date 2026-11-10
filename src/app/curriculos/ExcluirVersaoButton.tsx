"use client";

import { useFormStatus } from "react-dom";

export default function ExcluirVersaoButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm("Excluir este currículo personalizado? Esta ação não pode ser desfeita. O currículo original será preservado.")) {
          event.preventDefault();
        }
      }}
      className="btn-ghost-danger disabled:opacity-50"
    >
      {pending ? "Excluindo..." : "Excluir currículo personalizado"}
    </button>
  );
}
