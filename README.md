# Personality Form App

Uma aplicação web feita em **Next.js** para aplicar um formulário de personalidade e gerar resultados personalizados.  
Todos os envios são armazenados em um banco de dados **PostgreSQL** utilizando **Prisma ORM**.

## Funcionalidades
- Formulário de múltiplas perguntas com escalas de 1 a 5.
- Cálculo automático das pontuações e definição de um tipo de personalidade.
- Armazenamento de todas as respostas e resultados no banco de dados.
- Página individual de resultado com resumo das pontuações.
- API integrada (Next.js App Router) para submissão dos formulários.

## Tecnologias
- [Next.js 14+ (App Router)](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Zod](https://zod.dev/) para validação

## Como rodar localmente
```bash
git clone https://github.com/caed-ufsm/personality-form-app.git
cd personality-form-app
npm install
npx prisma migrate dev
npm run dev
