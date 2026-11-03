import GerenciarCategorias from "@/app/components/GerenciarCategorias";

export default function CategoriasPage() {
  return (
    <section aria-labelledby="categorias-title">
      <h1
        id="categorias-title"
        className="font-heading text-3xl font-extrabold"
      >
        Categorias
      </h1>

      <p className="mt-2 text-muted">
        Crie categorias para suas receitas e despesas.
      </p>

      <GerenciarCategorias />
    </section>
  );
}
