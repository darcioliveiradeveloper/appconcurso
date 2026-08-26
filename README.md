# 🎯 Concurso TI - App de Simulados

App de estudos para o concurso **Analista de Tecnologia da Informação e Comunicação** (Prefeitura de Ponta Grossa/PR).

## Stack

- **Backend**: Node.js + Express + MongoDB (Mongoose) + JWT
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Banco**: ~420 questões extraídas de 8 simulados (4 disciplinas + específicos)

## Funcionalidades

| Modo | Descrição |
|---|---|
| 📝 **Estudo Livre** | Escolha matéria + quantidade → feedback imediato por questão |
| 🎯 **Focado nas Difíceis** | Gera simulado com tópicos que você mais erra |
| 📋 **Prova Oficial** | 40 questões, 3h, timer, navegação livre, marcação — igual ao dia real |
| 📊 **Histórico/Estatísticas** | Evolução das notas + ranking de tópicos fracos |
| 🎓 **Recomendações** | Relatório pós-simulado indicando o que estudar |

## Como rodar (local)

### Pré-requisitos
- Node.js ≥ 18
- MongoDB rodando local (`mongodb://localhost:27017`) **ou** Docker

### Passos

```bash
# 1. Instalar dependências (backend + frontend)
npm install

# 2. Configurar ambiente
cd backend
cp .env.example .env   # edite com suas credenciais
cd ..

# 3. Subir MongoDB (se usar Docker)
docker-compose up -d mongodb

# 4. Popular banco (subjects + questões + admin)
npm run seed

# 5. Rodar tudo (backend :3000 + frontend :5173)
npm run dev
```

Acesse: **http://localhost:5173**

## Estrutura

```
appconcurso/
├── backend/
│   ├── src/
│   │   ├── config/        # db, jwt
│   │   ├── controllers/   # auth, subjects, simulados
│   │   ├── middlewares/   # auth, validation (zod), errors
│   │   ├── models/        # User, Subject, Question, SimuladoSession
│   │   ├── routes/
│   │   ├── services/      # recomendações e foco em dificuldade
│   │   ├── seeds/         # popula subjects/questions/admin
│   │   └── server.js
│   └── .env               # NUNCA COMMITAR
├── frontend/
│   └── src/
│       ├── api/           # axios + endpoints
│       ├── components/    # UI reutilizável
│       ├── contexts/      # AuthContext (JWT)
│       ├── pages/         # Login, Dashboard, Simulado, Prova, Resultado...
│       ├── App.jsx
│       └── main.jsx
├── docker-compose.yml     # MongoDB (+ backend opcional)
└── package.json           # workspaces + scripts root
```

## Regras da prova real (edital Tabela 05)

- 40 questões × 2,50 pts = 100 pts + títulos (20 pts)
- Mínimo por disciplina: 1 acerto (básicas) / 7 acertos (específicos)
- Nota geral mínima: 50 pts
- Data provável: **13/09/2026**

## Segurança

⚠️ `.env` está no `.gitignore` — credenciais do admin ficam apenas nele. Antes de publicar no GitHub, gere segredos fortes para `JWT_SECRET` e `JWT_REFRESH_SECRET`.
