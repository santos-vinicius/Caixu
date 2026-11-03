export type CategoriaDemo = {
  id: number;
  nomeCategoria: string;
  tipoCategoria: "RECEITA" | "DESPESA";
  usuarioId: number;
};

export const categoriasDemo: CategoriaDemo[] = [
  {
    id: 1,
    nomeCategoria: "Moradia",
    tipoCategoria: "DESPESA",
    usuarioId: 1,
  },
  {
    id: 2,
    nomeCategoria: "Alimentação",
    tipoCategoria: "DESPESA",
    usuarioId: 1,
  },
  {
    id: 3,
    nomeCategoria: "Casa",
    tipoCategoria: "DESPESA",
    usuarioId: 1,
  },
  {
    id: 4,
    nomeCategoria: "Trabalho",
    tipoCategoria: "RECEITA",
    usuarioId: 1,
  },
  {
    id: 5,
    nomeCategoria: "Outros recebimentos",
    tipoCategoria: "RECEITA",
    usuarioId: 1,
  },
];
