// Cargos extraídos dos editais enviados
export const CARGOS = [
  {
    code: 'PREF_TI',
    nome: 'Analista de TIC',
    orgao: 'Prefeitura de Ponta Grossa/PR',
    totalQuestoes: 40,
    distribuicao: [
      { subjectCode: 'PORT', subjectName: 'Língua Portuguesa', quantidade: 5, peso: 1, bloco: 'Único' },
      { subjectCode: 'MAT', subjectName: 'Matemática', quantidade: 5, peso: 1, bloco: 'Único' },
      { subjectCode: 'INF', subjectName: 'Informática Básica', quantidade: 5, peso: 1, bloco: 'Único' },
      { subjectCode: 'GER', subjectName: 'Conhecimentos Gerais', quantidade: 5, peso: 1, bloco: 'Único' },
      { subjectCode: 'ESP', subjectName: 'Conhecimentos Específicos (TI)', quantidade: 20, peso: 1, bloco: 'Único' }
    ]
  },
  {
    code: 'DEL_PCPR',
    nome: 'Delegado de Polícia',
    orgao: 'PCPR',
    totalQuestoes: 100,
    distribuicao: [
      { subjectCode: 'DIRPENAL', subjectName: 'Direito Penal', quantidade: 20, peso: 1, bloco: 'Único' },
      { subjectCode: 'DIRPROC', subjectName: 'Direito Processual Penal', quantidade: 20, peso: 1, bloco: 'Único' },
      { subjectCode: 'LEG_PPEXTRA', subjectName: 'Legislação Penal e Processual Penal Extravagante', quantidade: 20, peso: 1, bloco: 'Único' },
      { subjectCode: 'DIRCONST', subjectName: 'Direito Constitucional', quantidade: 10, peso: 1, bloco: 'Único' },
      { subjectCode: 'DIRADM_GP', subjectName: 'Direito Administrativo e Gestão Pública', quantidade: 10, peso: 1, bloco: 'Único' },
      { subjectCode: 'LEG_EST', subjectName: 'Legislação Estadual e Institucional', quantidade: 10, peso: 1, bloco: 'Único' },
      { subjectCode: 'DIRHUM', subjectName: 'Direitos Humanos', quantidade: 5, peso: 1, bloco: 'Único' },
      { subjectCode: 'CIE_FORENSE', subjectName: 'Ciências Forenses', quantidade: 5, peso: 1, bloco: 'Único' }
    ]
  },
  {
    code: 'AGENTE_PCPR',
    nome: 'Agente de Polícia Judiciária',
    orgao: 'PCPR',
    totalQuestoes: 100,
    distribuicao: [
      { subjectCode: 'PORT', subjectName: 'Língua Portuguesa', quantidade: 25, peso: 1, bloco: 'Gerais' },
      { subjectCode: 'RLM', subjectName: 'Raciocínio Lógico-Matemático', quantidade: 5, peso: 1, bloco: 'Gerais' },
      { subjectCode: 'REAL_PAR', subjectName: 'Realidade Étnica, Social, Histórica, Geográfica, Cultural, Política e Econômica do Paraná', quantidade: 5, peso: 1, bloco: 'Gerais' },
      { subjectCode: 'TEC_SEG', subjectName: 'Tecnologia e Sistemas de Informação e de Comunicação, Segurança Cibernética e Crimes Digitais', quantidade: 25, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'CIE_FORENSE', subjectName: 'Ciências Forenses', quantidade: 10, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'CONTAB', subjectName: 'Contabilidade Geral', quantidade: 5, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'ESTAT', subjectName: 'Estatística', quantidade: 5, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'LEG_EST', subjectName: 'Legislação Estadual e Institucional', quantidade: 5, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'DIRPENAL', subjectName: 'Direito Penal (incl. Leg. Penal Extravagante)', quantidade: 3, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'DIRPROC', subjectName: 'Direito Processual Penal (incl. Leg. Processual Penal Extravagante)', quantidade: 3, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'DIRCONST', subjectName: 'Direito Constitucional', quantidade: 3, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'DIRADM', subjectName: 'Direito Administrativo', quantidade: 3, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'DIRHUM', subjectName: 'Direitos Humanos', quantidade: 3, peso: 1, bloco: 'Específicos' }
    ]
  },
  {
    code: 'PAPILO_PCPR',
    nome: 'Papiloscopista Policial',
    orgao: 'PCPR',
    totalQuestoes: 100,
    distribuicao: [
      { subjectCode: 'PORT', subjectName: 'Língua Portuguesa', quantidade: 25, peso: 1, bloco: 'Gerais' },
      { subjectCode: 'RLM', subjectName: 'Raciocínio Lógico-Matemático', quantidade: 5, peso: 1, bloco: 'Gerais' },
      { subjectCode: 'REAL_PAR', subjectName: 'Realidade Étnica, Social, Histórica, Geográfica, Cultural, Política e Econômica do Paraná', quantidade: 5, peso: 1, bloco: 'Gerais' },
      { subjectCode: 'TEC_SEG', subjectName: 'Tecnologia e Sistemas de Informação e de Comunicação, Segurança Cibernética e Crimes Digitais', quantidade: 15, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'CIE_FORENSE', subjectName: 'Ciências Forenses', quantidade: 10, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'BIO', subjectName: 'Biologia', quantidade: 10, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'QUIM', subjectName: 'Química', quantidade: 5, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'FIS', subjectName: 'Física', quantidade: 5, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'LEG_EST', subjectName: 'Legislação Estadual e Institucional', quantidade: 5, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'DIRPENAL_APL', subjectName: 'Direito Penal Aplicado', quantidade: 3, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'DIRPROC_APL', subjectName: 'Direito Processual Penal Aplicado', quantidade: 3, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'DIRCONST', subjectName: 'Direito Constitucional', quantidade: 3, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'DIRADM', subjectName: 'Direito Administrativo', quantidade: 3, peso: 1, bloco: 'Específicos' },
      { subjectCode: 'DIRHUM', subjectName: 'Direitos Humanos', quantidade: 3, peso: 1, bloco: 'Específicos' }
    ]
  }
];

// Matérias novas necessárias para os cargos PCPR (além das 5 já existentes)
export const NEW_SUBJECTS = [
  { code: 'RLM', name: 'Raciocínio Lógico-Matemático', icon: '🧮', color: '#06B6D4', examWeight: 5, examQuestions: 5, minScore: 1, order: 6, bloco: 'Gerais' },
  { code: 'REAL_PAR', name: 'Realidade do Paraná', icon: '🗺️', color: '#F59E0B', examWeight: 5, examQuestions: 5, minScore: 1, order: 7, bloco: 'Gerais' },
  { code: 'TEC_SEG', name: 'Tec. da Informação e Seg. Cibernética', icon: '🔐', color: '#0EA5E9', examWeight: 15, examQuestions: 15, minScore: 1, order: 10, bloco: 'Específicos' },
  { code: 'CIE_FORENSE', name: 'Ciências Forenses', icon: '🔬', color: '#8B5CF6', examWeight: 10, examQuestions: 10, minScore: 1, order: 11, bloco: 'Específicos' },
  { code: 'BIO', name: 'Biologia', icon: '🧬', color: '#10B981', examWeight: 10, examQuestions: 10, minScore: 1, order: 12, bloco: 'Específicos' },
  { code: 'QUIM', name: 'Química', icon: '⚗️', color: '#EF4444', examWeight: 5, examQuestions: 5, minScore: 1, order: 13, bloco: 'Específicos' },
  { code: 'FIS', name: 'Física', icon: '⚛️', color: '#6366F1', examWeight: 5, examQuestions: 5, minScore: 1, order: 14, bloco: 'Específicos' },
  { code: 'CONTAB', name: 'Contabilidade Geral', icon: '📊', color: '#84CC16', examWeight: 5, examQuestions: 5, minScore: 1, order: 15, bloco: 'Específicos' },
  { code: 'ESTAT', name: 'Estatística', icon: '📈', color: '#14B8A6', examWeight: 5, examQuestions: 5, minScore: 1, order: 16, bloco: 'Específicos' },
  { code: 'LEG_EST', name: 'Legislação Estadual e Institucional', icon: '📜', color: '#F97316', examWeight: 10, examQuestions: 10, minScore: 1, order: 17, bloco: 'Específicos' },
  { code: 'DIRPENAL', name: 'Direito Penal', icon: '⚖️', color: '#DC2626', examWeight: 20, examQuestions: 20, minScore: 1, order: 18, bloco: 'Específicos' },
  { code: 'DIRPENAL_APL', name: 'Direito Penal Aplicado', icon: '⚖️', color: '#DC2626', examWeight: 3, examQuestions: 3, minScore: 1, order: 19, bloco: 'Específicos' },
  { code: 'DIRPROC', name: 'Direito Processual Penal', icon: '📋', color: '#991B1B', examWeight: 20, examQuestions: 20, minScore: 1, order: 20, bloco: 'Específicos' },
  { code: 'DIRPROC_APL', name: 'Direito Processual Penal Aplicado', icon: '📋', color: '#991B1B', examWeight: 3, examQuestions: 3, minScore: 1, order: 21, bloco: 'Específicos' },
  { code: 'LEG_PPEXTRA', name: 'Leg. Penal e Proc. Penal Extravagante', icon: '📚', color: '#7C2D12', examWeight: 20, examQuestions: 20, minScore: 1, order: 22, bloco: 'Específicos' },
  { code: 'DIRCONST', name: 'Direito Constitucional', icon: '🏛️', color: '#1D4ED8', examWeight: 10, examQuestions: 10, minScore: 1, order: 23, bloco: 'Específicos' },
  { code: 'DIRADM', name: 'Direito Administrativo', icon: '🏢', color: '#6B7280', examWeight: 10, examQuestions: 10, minScore: 1, order: 24, bloco: 'Específicos' },
  { code: 'DIRADM_GP', name: 'Dir. Administrativo e Gestão Pública', icon: '🏢', color: '#4B5563', examWeight: 10, examQuestions: 10, minScore: 1, order: 25, bloco: 'Específicos' },
  { code: 'DIRHUM', name: 'Direitos Humanos', icon: '🤝', color: '#059669', examWeight: 5, examQuestions: 5, minScore: 1, order: 26, bloco: 'Específicos' }
];
