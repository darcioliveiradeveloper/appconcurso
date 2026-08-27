# Concurso TI - App de Simulados

App de estudos para o concurso **Analista de Tecnologia da Informacao e Comunicacao** (Prefeitura de Ponta Grossa/PR).

## Online

**https://appconcurso-m3ov.onrender.com**

Login: `admin@voupassar.com.br` / `admin123`

## Stack

- **Backend**: Node.js + Express + MongoDB (Mongoose) + JWT
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Banco**: 400 questoes balanceadas (PORT 50, MAT 50, INF 50, GER 50, ESP 200)
- **Deploy**: Render (Web Service) + MongoDB Atlas

## Funcionalidades

| Modo | Descricao |
|---|---|
| Estudo Livre | Escolha materia + quantidade, feedback imediato por questao |
| Focado nas Dificeis | Gera simulado com topicos que voce mais erra |
| Prova Oficial | 40 questoes, 3h, timer, navegacao livre, marcacao - igual ao dia real |
| Historico/Estatisticas | Evolucao das notas + ranking de topicos fracos |
| Recomendacoes | Relatorio pos-simulado indicando o que estudar |

## Como rodar (local)

### Pre-requisitos
- Node.js >= 18
- MongoDB Atlas (ou local)

### Passos

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar ambiente
cd backend
cp .env.example .env
# edite .env com sua MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
cd ..

# 3. Popular banco
npm run seed

# 4. Rodar (backend :3000 + frontend :5173)
npm run dev
```

Acesse: **http://localhost:5173**

## Deploy no Render

### Variaveis de ambiente (Environment)

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | string do MongoDB Atlas |
| `JWT_SECRET` | texto longo (gerado pelo Render) |
| `JWT_REFRESH_SECRET` | texto longo (gerado pelo Render) |
| `ADMIN_EMAIL` | `admin@voupassar.com.br` |
| `ADMIN_PASSWORD` | `admin123` |

### Seed remoto

Apos o deploy, acesse no navegador para popular o banco:

```
https://appconcurso-m3ov.onrender.com/api/seed?key=admin123
```

Retorna JSON com os counts por materia e confirmacao.

## Estrutura

```
appconcurso/
├── backend/
│   ├── src/
│   │   ├── config/        # db, jwt
│   │   ├── controllers/   # auth, subjects, simulados
│   │   ├── middlewares/   # auth, validation, errors
│   │   ├── models/        # User, Subject, Question, SimuladoSession
│   │   ├── routes/
│   │   ├── services/      # recomendacoes e foco em dificuldade
│   │   ├── seeds/         # JSONs de questoes
│   │   └── server.js      # serve frontend em producao + API
│   └── .env               # NUNCA COMMITAR
├── frontend/
│   └── src/
│       ├── api/           # axios + endpoints
│       ├── components/    # UI reutilizavel (Card, Button, Modal...)
│       ├── contexts/      # AuthContext (JWT)
│       ├── pages/         # Login, Dashboard, Simulado, Prova, Resultado...
│       ├── App.jsx
│       └── main.jsx
├── render.yaml            # Blueprint Render
└── package.json           # workspaces + scripts root
```

## Regras da prova real (edital Tabela 05)

- 40 questoes x 2,50 pts = 100 pts + titulos (20 pts)
- Minimo por disciplina: 1 acerto (basicas) / 7 acertos (especificos)
- Nota geral minima: 50 pts
- Data provavel: **13/09/2026**

## Seguranca

`.env` esta no `.gitignore` - credenciais do admin ficam apenas nele. Nunca commitar chaves JWT ou strings de conexao.
