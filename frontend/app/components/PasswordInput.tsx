"use client";

import { useState } from "react";

type PasswordInputProps = {
  id: string;
  autoComplete: "current-password" | "new-password";
  placeholder: string;
};

export default function PasswordInput({
  id,
  autoComplete,
  placeholder,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name="senha"
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={100}
        required
        className="h-12 w-full rounded-xl border-2 border-border bg-surface pr-28 pl-3.5 
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
      <button
        type="button"
        onClick={() => setVisible((previous) => !previous)}
        aria-controls={id}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        className="absolute inset-y-1 right-1 rounded-lg bg-primary px-3 text-sm font-bold text-on-primary 
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {visible ? "Ocultar" : "Mostrar"}
      </button>
    </div>
  );
}
