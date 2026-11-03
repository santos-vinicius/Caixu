import AppHeader from "@/app/components/AppHeader";
import GerenciarCategorias from "@/app/components/GerenciarCategorias";

export default function CategoriasPage() {
  return (
    <section aria-labelledby="categorias-title">
      <AppHeader
        id="categorias-title"
        titulo="Categorias"
        descricao="Crie categorias para suas receitas e despesas."
      />

      <GerenciarCategorias />
    </section>
  );
}
