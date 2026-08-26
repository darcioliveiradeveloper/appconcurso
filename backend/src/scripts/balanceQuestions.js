import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TARGETS = { PORT: 50, MAT: 50, INF: 50, GER: 50, ESP: 200 };

// Questoes novas para completar cotas
const NOVAS = {
  MAT: [
    {
      topic: 'Regra de Três', difficulty: 'easy',
      text: 'Um servidor imprime 150 páginas em 5 minutos, mantendo o mesmo ritmo. Quantas páginas ele imprimirá em 12 minutos?',
      alternatives: ['300 páginas', '360 páginas', '420 páginas', '480 páginas'],
      correctIndex: 1,
      explanation: 'Regra de três: 150/5 = 30 páginas por minuto. Em 12 minutos: 30 x 12 = 360.'
    },
    {
      topic: 'Equações', difficulty: 'easy',
      text: 'Resolvendo a equação x/3 = 12, qual é o valor de x?',
      alternatives: ['4', '9', '36', '15'],
      correctIndex: 2,
      explanation: 'x/3 = 12 => x = 12 x 3 = 36.'
    },
    {
      topic: 'Porcentagem', difficulty: 'medium',
      text: 'Um equipamento custa R$ 800,00 e recebe 25% de desconto à vista. Qual o valor final a pagar?',
      alternatives: ['R$ 550,00', 'R$ 650,00', 'R$ 700,00', 'R$ 600,00'],
      correctIndex: 3,
      explanation: 'Desconto de 25% de 800 = 200. Valor final: 800 - 200 = 600.'
    }
  ],
  INF: [
    {
      topic: 'Excel', difficulty: 'medium',
      text: 'No Microsoft Excel, qual função soma apenas os valores de um intervalo que atendem a um determinado critério?',
      alternatives: ['SOMA', 'SOMASE', 'MÉDIASE', 'CONT.SE'],
      correctIndex: 1,
      explanation: 'SOMASE (SUMIF) soma valores condicionados a um critério. SOMA soma tudo; CONT.SE apenas conta.'
    },
    {
      topic: 'Windows', difficulty: 'easy',
      text: 'No sistema operacional Windows, o atalho de teclado Ctrl + Z tem a função de:',
      alternatives: ['Refazer a última ação', 'Copiar a seleção', 'Desfazer a última ação', 'Colar especial'],
      correctIndex: 2,
      explanation: 'Ctrl+Z desfaz; Ctrl+Y refaz.'
    },
    {
      topic: 'Segurança', difficulty: 'medium',
      text: 'Qual técnica de ataque sobrecarrega um servidor com milhares de requisições simultâneas, vindas de várias origens, até torná-lo indisponível?',
      alternatives: ['Phishing', 'Força bruta em senhas', 'Man-in-the-middle', 'Ataque de negação de serviço distribuído (DDoS)'],
      correctIndex: 3,
      explanation: 'DDoS (Distributed Denial of Service) satura os recursos do servidor com tráfego massivo distribuído.'
    },
    {
      topic: 'Internet/Intranet', difficulty: 'easy',
      text: 'O navegador de internet é classificado como um software destinado a:',
      alternatives: ['Gerenciar arquivos do disco', 'Acessar e exibir páginas da web', 'Proteger contra vírus', 'Editar documentos de texto'],
      correctIndex: 1,
      explanation: 'Navegadores (Chrome, Firefox, Edge) interpretam HTML e exibem conteúdo web.'
    },
    {
      topic: 'Arquivos', difficulty: 'easy',
      text: 'Qual extensão corresponde ao formato padrão de documentos do Microsoft Word (versões modernas)?',
      alternatives: ['.docx', '.xlsx', '.pptx', '.odp'],
      correctIndex: 0,
      explanation: '.docx = Word | .xlsx = Excel | .pptx = PowerPoint | .odp = Impress (LibreOffice).'
    }
  ],
  GER: [
    {
      topic: 'Economia PG', difficulty: 'medium',
      text: 'O TecnoParque de Ponta Grossa (PR) tem como principal objetivo fomentar:',
      alternatives: ['O turismo rural e religioso', 'A inovação e empresas de base tecnológica', 'A exploração mineral em larga escala', 'Eventos esportivos regionais'],
      correctIndex: 1,
      explanation: 'O TecnoParque é o parque tecnológico municipal, voltado à inovação, P&D e empresas de TIC.'
    },
    {
      topic: 'Saúde', difficulty: 'medium',
      text: 'Segundo as diretrizes do SUS, a porta de entrada preferencial do usuário no sistema de saúde é:',
      alternatives: ['A Atenção Básica (Unidades Básicas de Saúde)', 'Os hospitais de alta complexidade', 'O atendimento privado conveniado', 'As farmácias populares'],
      correctIndex: 0,
      explanation: 'A Atenção Básica/UBS é a porta de entrada organizadora do cuidado no SUS, resolvendo a maioria das demandas.'
    }
  ]
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const subjectsCol = db.collection('subjects');
  const questionsCol = db.collection('questions');

  const subjects = await subjectsCol.find().toArray();
  const map = {};
  subjects.forEach(s => map[s.code] = s._id);

  console.log('--- BALANCEAMENTO ---');
  for (const [code, target] of Object.entries(TARGETS)) {
    const subjectId = map[code];
    if (!subjectId) continue;
    
    let count = await questionsCol.countDocuments({ subject: subjectId });

    // Excluir excesso (mais recentes primeiro)
    if (count > target) {
      const extra = count - target;
      const newest = await questionsCol.find({ subject: subjectId })
        .sort({ _id: -1 }).limit(extra).toArray();
      const ids = newest.map(d => d._id);
      await questionsCol.deleteMany({ _id: { $in: ids } });
      count -= extra;
      console.log(`${code}: removidas ${extra} (excesso)`);
    }

    // Inserir faltantes
    if (count < target && NOVAS[code]) {
      const falta = target - count;
      const disponiveis = NOVAS[code];
      if (disponiveis.length < falta) {
        console.log(`${code}: ATENCAO - faltam ${falta} mas só há ${disponiveis.length} novas criadas`);
      }
      const inserir = disponiveis.slice(0, falta).map(q => ({
        subject: subjectId,
        topic: q.topic,
        difficulty: q.difficulty,
        text: q.text,
        alternatives: q.alternatives,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        source: 'Balanceamento',
        tags: [code],
        timesAnswered: 0,
        timesCorrect: 0,
        avgTimeMs: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      if (inserir.length) {
        await questionsCol.insertMany(inserir);
        count += inserir.length;
        console.log(`${code}: inseridas ${inserir.length} novas`);
      }
    }

    console.log(`${code}: ${count}/${target}`);
  }

  console.log('\n--- FINAL ---');
  for (const [code, target] of Object.entries(TARGETS)) {
    const c = await questionsCol.countDocuments({ subject: map[code] });
    console.log(`${code}: ${c} questões (alvo ${target}) ${c === target ? 'OK' : '<-- AJUSTAR'}`);
  }

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });