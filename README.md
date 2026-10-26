# Octafin

Simulador de empréstimo consignado com respostas de dois bancos. O
cliente envia seus dados, a API processa as consultas de forma assíncrona e a
interface apresenta as ofertas consolidadas, destacando a melhor opção.

## Stack, arquitetura e decisões técnicas

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui,
  React Hook Form e Yup.
- **Backend:** NestJS 11, TypeScript, Prisma, PostgreSQL, `pg-boss` e Jest.
- **Infraestrutura:** Docker Compose para PostgreSQL; API e frontend podem ser
  executados localmente.

```text
Next.js ──HTTP/JSON──> NestJS ──> PostgreSQL
                          │
                          └─ worker pg-boss
                              ├─ Banco Ouro
                              └─ Banco Prata
```

O backend separa domínio, aplicação, HTTP e infraestrutura. Cada banco possui
um adapter próprio, que normaliza sua resposta para o mesmo modelo interno.
Worker, deadline e reaper rodam no processo da API para manter o MVP simples.

## Como executar

### Pré-requisitos

- Node.js 20+
- npm
- Docker e Docker Compose

### Opção A: execute os serviços localmente

#### 1. Suba o banco

```bash
docker compose up -d db
```

O PostgreSQL ficará em `localhost:5434`, com credenciais padrão `octafin`.

#### 2. Execute a API

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:deploy
npm run start:dev
```

API: <http://localhost:3000>  
Swagger: <http://localhost:3000/docs>

#### 3. Execute o frontend

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Interface: <http://localhost:3001>

As variáveis disponíveis estão em
[`backend/.env.example`](/root/octafin/backend/.env.example) e
[`frontend/.env.example`](/root/octafin/frontend/.env.example).

### Opção B: execute tudo com Docker Compose

Depois de instalar Docker com o plugin Compose, execute na raiz do projeto:

```bash
docker compose up --build
```

Nesse modo, a API fica disponível em <http://localhost:3000>, o Swagger em
<http://localhost:3000/docs> e o frontend em <http://localhost:3001>.

## API

| Método | Rota | Objetivo |
| --- | --- | --- |
| `POST` | `/api/v1/simulations` | Cria uma simulação e inicia o processamento |
| `GET` | `/api/v1/simulations/:id` | Consulta status e ofertas |
| `GET` | `/docs` | Abre a documentação Swagger |

O `POST` recebe `name`, `email`, `cpf`, `birthDate`, `monthlySalary`,
`employerCnpj`, `requestedAmount`, `installments`, `consent` e,
opcionalmente, `idempotencyKey`. A resposta de uma nova simulação é
`201 Created`; uma chave de idempotência já existente retorna a simulação
correspondente.

## Dados e processamento

- Valores monetários são armazenados em centavos.
- O CPF persistido é mascarado; nome e e-mail não são armazenados.
- Cada simulação cria uma oferta para cada banco.
- Ofertas podem ser `PENDING`, `IN_PROGRESS`, `APPROVED`, `DENIED`, `TIMEOUT`
  ou `ERROR`.
- A simulação termina como `COMPLETED`, `PARTIAL` ou `FAILED`, conforme as
  decisões recebidas.
- Consultas aos bancos são paralelas, possuem timeout e retry com backoff.
- Deadline, bloqueio de linha e chave única evitam encerramentos concorrentes e
  duplicidade.

## Propostas de evolução

As propostas seguem o formato exigido: **Problema → Proposta → Por quê**.

### Implementadas

1. **Processamento assíncrono**
   - **Problema:** bancos externos podem responder lentamente ou falhar.
   - **Proposta:** enfileirar o processamento e acompanhar o status pela
     interface.
   - **Por quê:** a requisição não fica aberta durante a consulta e o cliente
     recebe progresso sem bloquear a API.

2. **Idempotência**
   - **Problema:** retry de rede ou duplo clique pode criar simulações
     duplicadas.
   - **Proposta:** aceitar uma chave opcional e única, inclusive em cenários
     concorrentes.
   - **Por quê:** evita ofertas duplicadas e torna a operação previsível.

3. **Minimização de dados**
   - **Problema:** guardar dados pessoais além do necessário aumenta o risco.
   - **Proposta:** persistir somente o CPF mascarado e não registrar dados
     pessoais em logs.
   - **Por quê:** reduz a exposição e o impacto de um eventual vazamento.

4. **Comparação das ofertas na mesma tela**
   - **Problema:** separar formulário e resultado dificulta a comparação.
   - **Proposta:** exibir o formulário e o resultado consolidado juntos, com a
     melhor oferta destacada.
   - **Por quê:** reduz fricção e ajuda o cliente a tomar a decisão.

### Planejadas (em ordem de prioridade)

1. **Transactional outbox e recuperação de jobs**
   - **Problema:** o processo pode cair entre o commit da simulação e o
     enfileiramento.
   - **Proposta:** registrar o evento na mesma transação e publicá-lo por um
     dispatcher.
   - **Por quê:** evita que uma simulação criada fique sem processamento.

2. **Criptografia do payload da fila**
   - **Problema:** dados usados pelo worker podem ficar legíveis no PostgreSQL.
   - **Proposta:** cifrar o payload com AES-256-GCM e chave validada por
     variável de ambiente.
   - **Por quê:** protege dados pessoais em repouso.

3. **Health checks e observabilidade**
   - **Problema:** falhas da API, banco ou fila são difíceis de diagnosticar.
   - **Proposta:** adicionar endpoints de saúde, logs estruturados e métricas.
   - **Por quê:** reduz o tempo de detecção e recuperação de incidentes.

4. **Circuit breaker e Dead Letter Queue**
   - **Problema:** bancos instáveis podem causar chamadas repetidas e jobs
     invisíveis após várias falhas.
   - **Proposta:** circuit breaker por banco, DLQ e alertas operacionais.
   - **Por quê:** protege a API e dá visibilidade às falhas persistentes.

## Limitações conhecidas

- Os bancos são fictícios; não há integração financeira real.
- O worker roda junto da API, o que limita sua escala independente.
- O payload da fila ainda não é criptografado e existe uma janela entre criar a
  simulação e publicar o job.
- Não há listagem de bancos, retentativa manual, testes E2E ou testes de
  frontend.
- O worker roda no mesmo processo da API; o Compose não o escala
  independentemente.

## Qualidade e testes

```bash
cd backend
npm test
npm run typecheck
npm run lint

cd ../frontend
npm run build
npm run lint
```
