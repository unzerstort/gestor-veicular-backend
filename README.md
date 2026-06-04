# gestor-veicular-backend

API REST para gestão de veículos com `Node.js`, `Express`, `TypeScript`, `PostgreSQL` e `Drizzle ORM`.

## Stack

- Node.js 20+
- Express
- TypeScript
- PostgreSQL
- Drizzle ORM
- Vitest + Supertest
- Deploy na Vercel com entrypoint serverless

## Como rodar localmente

```bash
npm install
cp .env.example .env
docker compose up -d
npm run db:push
npm run db:seed
npm run dev
```

API disponível em `http://localhost:3000`.

## Estrutura principal

```text
api/
drizzle/
src/
  config/
  controllers/
  db/
  errors/
  middlewares/
  repositories/
  routes/
  schemas/
  services/
  types/
tests/
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gestor_veicular
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gestor_veicular_test
DATABASE_SSL_MODE=disable
```

### `DATABASE_SSL_MODE`

Valores suportados:

- `disable`: sem SSL, ideal para desenvolvimento local
- `require`: SSL com validação de certificado, padrão implícito em produção
- `no-verify`: SSL sem validar certificado, usar apenas quando o provedor exigir

## Scripts

```bash
npm install
npm run dev
npm run build
npm start
npm run check
npm run test
npm run test:integration
npm run test:all
npm run db:generate
npm run db:push
npm run db:studio
npm run db:seed
```

## Fluxo de banco

- O schema Drizzle está em `src/db/schema.ts`
- A migration inicial está em `drizzle/0000_initial_vehicles.sql`
- Para sincronizar o banco a partir do schema, use `npm run db:push`
- Para gerar novas migrations Drizzle, use `npm run db:generate`
- Para inspecionar o banco visualmente, use `npm run db:studio`
- Para inserir 5 veículos iniciais, use `npm run db:seed`
- O seed abre e fecha sua própria conexão, então o processo termina sozinho

## Banco local com Docker

O repositorio inclui `docker-compose.yml` com um PostgreSQL 16 em `localhost:5432`.

```bash
docker compose up -d
```

Credenciais padrão:

- banco: `gestor_veicular`
- usuario: `postgres`
- senha: `postgres`

## Testes de integração

- Crie um banco de teste separado, por exemplo `gestor_veicular_test`
- Configure `TEST_DATABASE_URL` apontando para esse banco
- A suite aplica `drizzle/0000_initial_vehicles.sql` automaticamente no banco de teste
- Rode `npm run test:integration` para validar a API contra PostgreSQL real

## Endpoints

Base path: `/api`

### `POST /api/vehicles`

Cria um veículo.

```json
{
  "plate": "ABC1D23",
  "brand": "Volkswagen",
  "model": "Gol",
  "year": 2020,
  "color": "Prata"
}
```

### `GET /api/vehicles`

Lista todos os veículos. Aceita filtros opcionais:

- `brand`
- `year`

### `GET /api/vehicles/:id`

Retorna um veículo pelo id.

### `PATCH /api/vehicles/:id`

Atualiza parcialmente um veículo.

### `DELETE /api/vehicles/:id`

Remove um veículo e retorna `204 No Content`.

### `GET /api/health`

Health check simples da aplicação.

Resposta:

```json
{
  "status": "ok"
}
```

## Tratamento de erros

Os erros seguem `application/problem+json` no formato RFC 7807.

Exemplo:

```json
{
  "type": "https://gestor-veicular.dev/problems/validation-error",
  "title": "Validation error",
  "status": 400,
  "detail": "The request payload or query parameters are invalid.",
  "instance": "/api/vehicles",
  "errors": [
    {
      "path": "plate",
      "message": "Plate must match a valid Brazilian format (ABC1234 or ABC1D23).",
      "code": "custom"
    }
  ]
}
```

## Deploy

O projeto inclui `vercel.json` com rewrite de todas as rotas para `/api`, usando `api/index.ts` como entrypoint serverless.
