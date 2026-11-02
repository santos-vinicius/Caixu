import Image from "next/image";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen">
      <div className="grid min-h-screen w-full min-[621px]:grid-cols-2">
        <section
          aria-labelledby="welcome-title"
          className="grid place-items-center bg-brand-plum p-7 text-brand-cream min-[621px]:p-12"
        >
          <div className="w-full max-w-[480px]">
            <Image
              src="/images/caixu-motion-horizontal-dark.svg"
              alt="Caixu"
              width={1000}
              height={400}
              className="mb-10 h-auto w-full max-w-[320px]"
              unoptimized
            />

            <h2
              id="welcome-title"
              className="font-heading text-[30px] leading-[1.2] font-extrabold tracking-tight min-[621px]:text-[38px]"
            >
              Seu dinheiro em ordem.
              <br />
              Seus planos mais próximos.
            </h2>

            <p className="mt-5 text-lg leading-relaxed text-dark-muted">
              Acompanhe o que entra, organize o que sai e veja o que vem pela
              frente.
            </p>

            <p className="mt-8 text-sm font-bold text-brand-cream">
              Menos dúvida. Mais clareza no seu dia a dia.
            </p>
          </div>
        </section>

        <div className="self-center px-5.5 py-7 min-[621px]:p-12">
          {children}
        </div>
      </div>
    </main>
  );
}
