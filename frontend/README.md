# Caixu — Frontend

Interface React com Next.js App Router, TypeScript e Tailwind CSS, conectada à API REST Spring Boot. Inclui autenticação, dashboard, calendário financeiro e gestão de transações, categorias e perfil, com identidade visual própria e navegação responsiva.

As instruções completas do banco, backend e arquitetura estão no [README do projeto](../README.md).

## Executar

Use Node.js 24 e npm. Na pasta `frontend`:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abra [localhost:3000](http://localhost:3000). A API deve estar ativa em `http://localhost:8080/api`. Se necessário, ajuste `NEXT_PUBLIC_API_URL` em `.env.local` e a origem permitida no backend.

Crie sua própria conta na página `/cadastro`. A interface utiliza sessão em cookie e token CSRF para as operações de escrita. As transações e categorias são persistidas pela API, sem fallback para dados de demonstração.

## Verificações e build

```bash
npm run lint
npm test
npm run build
```

Depois do build, `npm start` serve a aplicação localmente. Os testes de cálculos não dependem da API; validar cadastro, login e operações financeiras exige o backend e o Oracle configurados.

## Organização

- `app/`: rotas, layouts, componentes, estado e integração com a API.
- `public/`: imagens e fontes locais da identidade Caixu.
- `tests/`: testes dos cálculos financeiros.

Metas, reserva financeira e recuperação de senha ainda não possuem fluxo funcional completo. Não coloque segredos em variáveis `NEXT_PUBLIC_*`, pois elas são expostas ao navegador. Dependências, builds e `.env.local` permanecem fora do Git.
