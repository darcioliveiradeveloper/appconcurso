# Vou Passar - App de Simulados

Plataforma de estudos para concursos: **Prefeitura de Ponta Grossa/PR (Analista de TIC)** e **PCPR (Delegado, Agente de Polícia Judiciária e Papiloscopista)**.

## Online

**https://appconcurso-m3ov.onrender.com**

Login: `admin@voupassar.com.br` / `admin123` (após seed)

## Stack

- **Backend**: Node.js + Express + MongoDB (Mongoose) + JWT
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Banco**: 400 questões balanceadas (PREF_TI: PORT 50, MAT 50, INF 50, GER 50, ESP 200) + matérias PCPR (RLM, REAL_PAR, TEC_SEG, CIE_FORENSE, BIO, QUIM, FIS, etc. — inicialmente sem questões, aguardando import)
- **Deploy**: Render (Web Service) + MongoDB Atlas

## Cargos

| Código | Cargo | Órgão | Questões |
|---|---|---|---|
| `PREF_TI` | Analista de TIC | Prefeitura Ponta Grossa/PR | 40 |
| `DEL_PCPR` | Delegado de Polícia | PCPR | 100 |
| `AGENTE_PCPR` | Agente de Polícia Judiciária | PCPR | 100 |
| `PAPILO_PCPR` | Papiloscopista Policial | PCPR | 100 |

Distribuição e pesos conforme edital em `backend/src/seeds/cargosData.js`.

## Funcionalidades

| Modo | Descrição |
|---|---|
| **Cargos** | Tela de entrada com explicação do app e seleção do cargo (sem pré-seleção, ordem PREF_TI → PCPR) |
| **Estudo Livre** | Escolha matéria do cargo + quantidade, feedback imediato por questão, barra só Próxima/Finalizar (voltar bloqueado, sem duplicar nota) |
| **Focado nas Difíceis** | Gera simulado com tópicos que você mais erra |
| **Prova Oficial** | Questões e tempo conforme cargo, timer, navegação e marcação, modal de confirmação, correção com nota e aprovação |
| **Histórico/Estatísticas** | Evolução, desempenho por disciplina (com nome correto), tópicos fracos, botão Limpar por filtro |
| **Recomendações** | Relatório pós-simulado indicando o que estudar |
| **Revisão** | Após a prova, lista só as respondidas com correta em verde vs sua resposta, explicação, expandir ao tocar |
| **Códigos de Liberação** | Admin gera códigos `XXXXX-XXXXX` (aceita com/sem hífen, uso único), lista, revoga, gera novo para usuário e exclui/bloqueia mantendo cadastro |

## Como rodar (local)

### Pré-requisitos
- Node.js ≥ 18
- MongoDB Atlas (ou local)

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cd backend
cp .env.example .env
# edite .env com MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
cd ..

# 3. Popular banco
npm run seed

# 4. Rodar (backend :3000 + frontend :5173)
npm run dev
```

Acesse: **http://localhost:5173**

## Deploy no Render

### Variáveis de ambiente (Environment)

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | string do MongoDB Atlas |
| `JWT_SECRET` | texto longo (gerado pelo Render) |
| `JWT_REFRESH_SECRET` | texto longo (gerado pelo Render) |
| `ADMIN_EMAIL` | `admin@voupassar.com.br` |
| `ADMIN_PASSWORD` | `admin123` |
| `RENDER_EXTERNAL_URL` | `https://appconcurso-m3ov.onrender.com` (opcional, para CORS) |

### Seed remoto

Após o deploy, acesse no navegador para popular o banco (cria cargos, matérias, 400 questões e admin):

```
https://appconcurso-m3ov.onrender.com/api/seed?key=admin123
```

Retorna JSON com counts por matéria, cargos e confirmação.

### Build

```
npm install && npm run build   # gera frontend/dist
npm run start                  # serve em produção na porta $PORT
```

`render.yaml` já configurado com `buildCommand: npm install && npm run build`.

## Estrutura

```
appconcurso/
├── backend/
│   ├── src/
│   │   ├── config/        # db, jwt
│   │   ├── controllers/   # auth, subjects, simulados, accessCode
│   │   ├── middlewares/   # auth (protect/authorize), validation (zod), errors
│   │   ├── models/        # User, Subject, Question, SimuladoSession, Cargo, AccessCode
│   │   ├── routes/        # auth, subjects, simulados, cargos, access-codes
│   │   ├── services/      # recomendações e foco
│   │   ├── seeds/         # JSONs de questões + cargosData.js
│   │   └── server.js      # serve frontend em produção + API
│   └── .env               # NUNCA COMMITAR
├── frontend/
│   └── src/
│       ├── api/           # axios + endpoints (subjects, simulados, cargos, access-codes)
│       ├── components/    # Card, Button, Input, RadioOption, Modal, Layout
│       ├── contexts/      # AuthContext (JWT)
│       ├── pages/         # Login, Register, CargoSelect, Dashboard, SubjectSelect, Question, ExamMode, Result, History, Stats, AccessCodes
│       ├── App.jsx        # rotas: / (cargos), /inicio, /simulado/novo, /prova-oficial, /historico, /estatisticas, /admin/codigos
│       └── main.jsx
├── render.yaml
└── package.json           # workspaces + scripts root (v1.1.0)
```

## Regras da prova

- **PREF_TI**: 40q × 2,5 pts = 100 pts, mínimo 1 acerto nas básicas e 7 nos específicos, ≥50 pts para aprovar
- **PCPR**: 100q × 1 pt = 100 pts, sem eliminatória por disciplina no modelo atual (apenas ≥50%)
- Datas: PCPR 11/10/2026, PREF_TI 13/09/2026 (estimada)

## Segurança

`.env` está no `.gitignore`. `AccessCode` com formato `XXXXX-XXXXX`, normalizado (com/sem hífen). `User.isActive` controla bloqueio ao excluir código. `SimuladoSession.questionOrder` com `ref: 'Question'` para popular revisão.

## Versão

**v1.1.0** — multi-cargo, códigos de liberação, navegação travada, revisão expandível, histórico filtrado.
