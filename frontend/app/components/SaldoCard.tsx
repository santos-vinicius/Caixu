import { formatarMoeda } from "@/app/lib/formatters";

type SaldoCardProps = {
  titulo: string;
  valor: number;
  descricao: string;
  destaque?: boolean;
};

export default function SaldoCard({
  titulo,
  valor,
  descricao,
  destaque = false,
}: SaldoCardProps) {
  return (
    <div
      className={`min-w-0 rounded-3xl border border-border p-4 sm:p-6 ${
        destaque ? "bg-surface" : "bg-background"
      }`}
    >
      <h2 className="text-sm font-bold text-muted">{titulo}</h2>

      <p className="mt-3 text-3xl font-extrabold tabular-nums [overflow-wrap:anywhere]">
        {formatarMoeda(valor)}
      </p>

      <p className="mt-3 text-sm text-muted">{descricao}</p>
    </div>
  );
}
