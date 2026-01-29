
import { Institution, GRIIndicator, KPIMetric, GapSummary, InstitutionId, Notification, HierarchyNode, UserProfile, Pillar, ODS, Respondent, ImpactProject } from './types';

export const INSTITUTIONS: Institution[] = [
  { id: 'SENAC', name: 'Senac RJ', fullName: 'Serviço Nacional de Aprendizagem Comercial', color: 'bg-orange-500', theme: 'orange', logoInitial: 'S' },
  { id: 'SESC', name: 'Sesc RJ', fullName: 'Serviço Social do Comércio', color: 'bg-blue-600', theme: 'blue', logoInitial: 'S' },
  { id: 'FECOMERCIO', name: 'Fecomércio RJ', fullName: 'Federação do Comércio', color: 'bg-indigo-800', theme: 'indigo', logoInitial: 'F' },
  { id: 'IFS', name: 'IFs', fullName: 'Instituto Fecomércio de Seguridade', color: 'bg-green-600', theme: 'green', logoInitial: 'I' },
  { id: 'IFEC', name: 'IFEC', fullName: 'Instituto Fecomércio de Educação', color: 'bg-purple-600', theme: 'purple', logoInitial: 'E' },
  { id: 'GROUP', name: 'Visão Consolidada', fullName: 'Sistema Fecomércio RJ (Grupo)', color: 'bg-slate-800', theme: 'slate', logoInitial: 'G' },
];

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'u1',
    name: 'Antonio Florencio',
    email: 'presidencia@fecomercio-rj.org.br',
    role: 'PRESIDENT',
    avatarInitials: 'AF',
    allowedInstitutions: ['SENAC', 'SESC', 'FECOMERCIO', 'IFS', 'IFEC', 'GROUP'],
    permissions: { canEdit: false, canApprove: true, canViewConsolidated: true, canConfigure: true }
  },
  {
    id: 'u2',
    name: 'Caio Azeredo',
    email: 'cazeredo@rj.senac.br',
    role: 'ASG_MANAGER',
    avatarInitials: 'CA',
    department: 'Sustentabilidade',
    // Manager has full access to their unit, read access to others (RF002.4 example)
    allowedInstitutions: ['SENAC', 'SESC', 'FECOMERCIO', 'IFS', 'IFEC'], 
    permissions: { canEdit: true, canApprove: true, canViewConsolidated: false, canConfigure: true }
  },
  {
    id: 'u3',
    name: 'Maria Silva',
    email: 'auditoria@fecomercio.com.br',
    role: 'INTERNAL_AUDITOR',
    avatarInitials: 'MS',
    department: 'Auditoria Interna',
    allowedInstitutions: ['SENAC', 'SESC', 'FECOMERCIO', 'IFS', 'IFEC'],
    permissions: { canEdit: false, canApprove: true, canViewConsolidated: true, canConfigure: false }
  },
  {
    id: 'u4',
    name: 'João Santos',
    email: 'jsantos@rj.sesc.br',
    role: 'AREA_COORDINATOR',
    avatarInitials: 'JS',
    department: 'Facilities / Infraestrutura',
    allowedInstitutions: ['SESC'],
    permissions: { canEdit: true, canApprove: false, canViewConsolidated: false, canConfigure: false }
  }
];

export const MOCK_RESPONDENTS: Respondent[] = [
  {
    id: 'r1',
    name: 'João Santos',
    email: 'jsantos@rj.sesc.br',
    role: 'Coordenador',
    department: 'Facilities',
    status: 'ACTIVE',
    lastAccess: 'Hoje, 09:30',
    indicatorsAssigned: 12,
    indicatorsCompleted: 8,
    avatarInitials: 'JS'
  },
  {
    id: 'r2',
    name: 'Ana Financeiro',
    email: 'ana@rj.senac.br',
    role: 'Gerente',
    department: 'Financeiro',
    status: 'ACTIVE',
    lastAccess: 'Ontem',
    indicatorsAssigned: 8,
    indicatorsCompleted: 8,
    avatarInitials: 'AF'
  },
  {
    id: 'r3',
    name: 'Maria RH',
    email: 'mrh@fecomercio.com.br',
    role: 'Analista Sr',
    department: 'Recursos Humanos',
    status: 'PENDING',
    lastAccess: 'Nunca',
    indicatorsAssigned: 15,
    indicatorsCompleted: 2,
    avatarInitials: 'MR'
  },
  {
    id: 'r4',
    name: 'Carlos TI',
    email: 'cti@ifs.com.br',
    role: 'Coordenador',
    department: 'Tecnologia',
    status: 'INACTIVE',
    lastAccess: 'Há 15 dias',
    indicatorsAssigned: 5,
    indicatorsCompleted: 0,
    avatarInitials: 'CT'
  }
];

export const MOCK_INDICATORS: GRIIndicator[] = [
  // GRI Indicators
  { 
    code: '302-1', 
    title: 'Consumo de energia dentro da organização', 
    dimension: 'Environmental', 
    framework: 'GRI', 
    description: 'Total de combustível consumido de fontes renováveis e não renováveis.', 
    materialityScore: 5,
    questions: [
      { id: 'q1', text: 'Informe o total de energia elétrica consumida (kWh)', type: 'NUMBER', required: true },
      { id: 'q2', text: 'Houve redução comparada ao ano anterior?', type: 'SELECT_SINGLE', options: ['Sim', 'Não'], required: true },
      { id: 'q3', text: 'Detalhamento por Fonte de Energia', type: 'TABLE', required: true, columns: ['Fonte de Energia', 'Consumo (kWh)', 'Unidade Original', 'Tipo (Renovável/Não)'] }
    ]
  },
  { 
    code: '305-1', 
    title: 'Emissões diretas (Escopo 1) de GEE', 
    dimension: 'Environmental', 
    framework: 'GRI', 
    description: 'Emissões brutas de GEE diretas em toneladas de CO2 equivalente. Algumas questões exigem colaboração de Facilities e Financeiro.', 
    materialityScore: 5,
    questions: [
      { id: 'q_scope1_total', text: 'Emissões Totais (tCO2e)', type: 'NUMBER', required: true },
      { id: 'q_scope1_desc', text: 'Metodologia de Cálculo utilizada', type: 'TEXT_LONG', required: false }
    ]
  },
  { 
    code: '401-1', 
    title: 'Novas contratações e rotatividade de empregados', 
    dimension: 'Social', 
    framework: 'GRI', 
    description: 'Número total e taxa de novas contratações e rotatividade por faixa etária, gênero e região.', 
    materialityScore: 4,
    questions: [
      { id: 'q_hire_total', text: 'Total de Novas Contratações', type: 'NUMBER', required: true },
      { id: 'q_turnover_rate', text: 'Taxa de Rotatividade (%)', type: 'NUMBER', required: true },
      { id: 'q_hire_table', text: 'Contratações por Gênero e Idade', type: 'TABLE', required: false, columns: ['Faixa Etária', 'Homens', 'Mulheres', 'Outros'] }
    ]
  },
  { 
    code: '404-1', 
    title: 'Média de horas de treinamento por ano', 
    dimension: 'Social', 
    framework: 'GRI', 
    description: 'Média de horas de treinamento que os empregados da organização receberam durante o período.', 
    materialityScore: 4 
  },
  { 
    code: '205-2', 
    title: 'Comunicação e treinamento sobre anticorrupção', 
    dimension: 'Governance', 
    framework: 'GRI', 
    description: 'Número e porcentagem de membros da governança informados sobre políticas anticorrupção.', 
    materialityScore: 5 
  },
  { 
    code: '201-1', 
    title: 'Valor econômico direto gerado e distribuído', 
    dimension: 'Economic', 
    framework: 'GRI', 
    description: 'Receitas, custos operacionais, salários, pagamentos a provedores de capital, etc.', 
    materialityScore: 4 
  },
  
  // Ethos Indicators
  { code: 'ETHOS-1', title: 'Visão e Estratégia', dimension: 'Governance', framework: 'ETHOS', description: 'Avalia se a empresa possui uma visão estratégica que incorpore a responsabilidade social.', materialityScore: 5 },
  { code: 'ETHOS-8', title: 'Compromisso com o desenvolvimento infantil', dimension: 'Social', framework: 'ETHOS', description: 'Ações da empresa para a proteção e desenvolvimento de crianças e adolescentes.', materialityScore: 4 },
  { code: 'ETHOS-12', title: 'Relações com a concorrência', dimension: 'Economic', framework: 'ETHOS', description: 'Postura ética da empresa em relação aos seus concorrentes e práticas de mercado leal.', materialityScore: 3 },
  { code: 'ETHOS-22', title: 'Gerenciamento de impactos ambientais', dimension: 'Environmental', framework: 'ETHOS', description: 'Existência de políticas e práticas para gerenciar e mitigar impactos ambientais.', materialityScore: 5 },
];

export const MOCK_PILLARS: Pillar[] = [
  {
    id: 'p1',
    title: 'Pilar Econômico',
    odss: ['8', '9'],
    notebooks: [
      {
        id: 'n1',
        title: 'GRI 201: Desempenho Econômico',
        contents: [
          {
            id: 'c1',
            code: '201-1',
            title: 'Valor econômico direto gerado e distribuído',
            description: 'Receitas, custos operacionais, salários, pagamentos a provedores de capital, etc.',
            questions: [
              { id: 'q1', text: 'Informe a receita bruta total (R$)', type: 'NUMBER', required: true },
              { id: 'q2', text: 'Informe os custos operacionais totais (R$)', type: 'NUMBER', required: true },
              { id: 'q3', text: 'Anexe o demonstrativo financeiro auditado', type: 'FILE', required: true }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'p2',
    title: 'Pilar Ambiental',
    odss: ['13', '12', '7'],
    notebooks: [
      {
        id: 'n2',
        title: 'GRI 302: Energia',
        contents: [
          {
            id: 'c2',
            code: '302-1',
            title: 'Consumo de energia dentro da organização',
            description: 'Total de combustíveis e eletricidade.',
            questions: [
              { id: 'q4', text: 'Consumo total de eletricidade (kWh)', type: 'NUMBER', required: true },
              { id: 'q5', text: 'Consumo de combustíveis fósseis (Litros)', type: 'NUMBER', required: false },
              { id: 'q6', text: 'Detalhamento', type: 'TABLE', required: true, columns: ['Fonte', 'Qtd', 'Unidade'] }
            ]
          }
        ]
      }
    ]
  }
];

export const MOCK_KPIS: Record<InstitutionId, KPIMetric[]> = {
  SENAC: [
    { label: 'Índice GRI', value: '47.5%', change: 7.4, trend: 'up' },
    { label: 'Cobertura', value: '78%', change: 5.0, trend: 'up' },
    { label: 'GAPs Críticos', value: '23', change: -3, trend: 'up' }, // trend up means improvement (less gaps)
    { label: 'Score Médio', value: '2.4/4', change: 0.3, trend: 'up' },
  ],
  SESC: [
    { label: 'Índice GRI', value: '38.3%', change: 4.1, trend: 'up' },
    { label: 'Cobertura', value: '65%', change: 2.5, trend: 'up' },
    { label: 'GAPs Críticos', value: '31', change: -1, trend: 'up' },
    { label: 'Score Médio', value: '2.1/4', change: 0.1, trend: 'up' },
  ],
  FECOMERCIO: [
    { label: 'Índice GRI', value: '41.4%', change: 5.2, trend: 'up' },
    { label: 'Cobertura', value: '72%', change: 3.8, trend: 'up' },
    { label: 'GAPs Críticos', value: '18', change: -5, trend: 'up' },
    { label: 'Score Médio', value: '2.6/4', change: 0.4, trend: 'up' },
  ],
  IFS: [
    { label: 'Índice GRI', value: '26.3%', change: 8.0, trend: 'up' },
    { label: 'Cobertura', value: '45%', change: 10.0, trend: 'up' },
    { label: 'GAPs Críticos', value: '42', change: -2, trend: 'up' },
    { label: 'Score Médio', value: '1.8/4', change: 0.5, trend: 'up' },
  ],
  IFEC: [
    { label: 'Índice GRI', value: '32.5%', change: 1.2, trend: 'up' },
    { label: 'Cobertura', value: '55%', change: 1.5, trend: 'up' },
    { label: 'GAPs Críticos', value: '28', change: 0, trend: 'neutral' },
    { label: 'Score Médio', value: '2.0/4', change: 0.1, trend: 'up' },
  ],
  GROUP: [
    { label: 'Média Índice GRI', value: '37.2%', change: 5.1, trend: 'up' },
    { label: 'Total GAPs', value: '142', change: -11, trend: 'up' },
    { label: 'Unidades', value: '128', change: 0, trend: 'neutral' },
    { label: 'Colaboradores', value: '12.4k', change: 1.2, trend: 'up' },
  ],
};

// RF008.2 Scenarios:
// Gap 1: 7 days (7 days before deadline rule)
// Gap 2: 0 days (On deadline rule)
// Gap 3: -7 days (7 days after deadline rule)
// Gap 4: -30 days (30 days after deadline rule)
export const MOCK_GAPS: GapSummary[] = [
  { id: '1', indicatorCode: '305-1', title: 'Emissões de GEE (Escopo 1)', department: 'Facilities', responsible: 'João Facilities', daysToDeadline: 7, criticality: 'HIGH' },
  { id: '2', indicatorCode: '404-1', title: 'Horas de Treinamento', department: 'RH', responsible: 'Maria RH', daysToDeadline: 0, criticality: 'HIGH' },
  { id: '3', indicatorCode: '302-1', title: 'Consumo Energético', department: 'Infraestrutura', responsible: 'Pedro Infra', daysToDeadline: -7, criticality: 'MEDIUM' },
  { id: '4', indicatorCode: '201-1', title: 'Valor Econômico', department: 'Financeiro', responsible: 'Ana Financeiro', daysToDeadline: -30, criticality: 'MEDIUM' },
];

export const DEPARTMENTS = [
  'Recursos Humanos',
  'Facilities / Infraestrutura',
  'Financeiro',
  'Tecnologia da Informação',
  'Pedagógico',
  'Comunicação',
  'Jurídico',
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'ANOMALY',
    title: 'Anomalia Detectada pela IA',
    message: 'Consumo de energia (302-1) aumentou 250% em comparação ao ano anterior. Por favor, verifique se houve erro de digitação ou mudança operacional.',
    timestamp: 'Há 10 min',
    read: false,
    priority: 'HIGH',
    actions: [
      { label: 'Verificar Dado', actionId: 'verify', style: 'primary' },
      { label: 'Dispensar', actionId: 'dismiss', style: 'secondary' }
    ]
  },
  {
    id: '2',
    type: 'DELEGATION',
    title: 'Nova Delegação Recebida',
    message: 'O setor de TI delegou o indicador GRI 418-1 (Privacidade de Dados) para sua responsabilidade.',
    timestamp: 'Há 2 horas',
    read: false,
    priority: 'MEDIUM',
    actions: [
      { label: 'Aceitar', actionId: 'accept', style: 'success' },
      { label: 'Rejeitar', actionId: 'reject', style: 'danger' }
    ]
  },
  {
    id: '3',
    type: 'GAP_REMINDER',
    title: 'Prazo de GAP Próximo',
    message: 'O prazo para resolução do GAP no indicador GRI 305-1 vence em 7 dias. Atualize o plano de ação.',
    timestamp: 'Há 1 dia',
    read: true,
    priority: 'HIGH',
    actions: [
      { label: 'Atualizar Plano', actionId: 'update_plan', style: 'primary' }
    ]
  },
  {
    id: '4',
    type: 'APPROVAL',
    title: 'Aprovação Pendente',
    message: 'Respostas da dimensão Social aguardam sua validação para consolidação.',
    timestamp: 'Há 2 dias',
    read: false,
    priority: 'MEDIUM',
    actions: [
      { label: 'Revisar', actionId: 'review', style: 'primary' }
    ]
  },
  {
    id: '5',
    type: 'DEADLINE',
    title: 'Prazo de Coleta',
    message: 'O ciclo de coleta 2024 se encerra em 5 dias. 12 indicadores ainda pendentes.',
    timestamp: 'Há 3 dias',
    read: true,
    priority: 'MEDIUM',
  }
];

export const MOCK_HIERARCHY: HierarchyNode = {
  id: '1',
  type: 'SECTOR',
  name: 'Presidência do Sistema',
  level: 'PRESIDENCY',
  responsibleName: 'Antonio Florencio',
  responsibleEmail: 'presidencia@fecomercio-rj.org.br',
  institutionId: 'GROUP',
  children: [
    {
      id: '2',
      type: 'SECTOR',
      name: 'Diretoria Executiva Senac RJ',
      level: 'EXECUTIVE_DIRECTION',
      responsibleName: 'Diretor Senac',
      responsibleEmail: 'diretoria@rj.senac.br',
      institutionId: 'SENAC',
      children: [
        {
          id: '21',
          type: 'SECTOR',
          name: 'Gerência de TI',
          level: 'MANAGEMENT',
          responsibleName: 'Gestor TI',
          responsibleEmail: 'ti@rj.senac.br',
          institutionId: 'SENAC',
          children: [
            {
              id: '211',
              type: 'SECTOR',
              name: 'Setor de Desenvolvimento',
              level: 'OPERATIONAL_SECTOR',
              responsibleName: 'Líder Dev',
              responsibleEmail: 'dev@rj.senac.br',
              institutionId: 'SENAC',
              children: [
                {
                   id: 'p1',
                   type: 'PERSON',
                   name: 'Dev Senior 1',
                   role: 'Analista Pleno',
                   level: 'STAFF',
                   responsibleEmail: 'dev1@rj.senac.br',
                   avatarUrl: 'https://ui-avatars.com/api/?name=DS&background=random'
                }
              ]
            },
            {
              id: '212',
              type: 'SECTOR',
              name: 'Setor de Infraestrutura',
              level: 'OPERATIONAL_SECTOR',
              responsibleName: 'Líder Infra',
              responsibleEmail: 'infra@rj.senac.br',
              institutionId: 'SENAC',
            }
          ]
        },
        {
          id: '22',
          type: 'SECTOR',
          name: 'Gerência de RH',
          level: 'MANAGEMENT',
          responsibleName: 'Gestora RH',
          responsibleEmail: 'rh@rj.senac.br',
          institutionId: 'SENAC',
          children: [
             {
              id: '221',
              type: 'SECTOR',
              name: 'Recrutamento',
              level: 'OPERATIONAL_SECTOR',
              responsibleName: 'Analista Sr',
              responsibleEmail: 'recrutamento@rj.senac.br',
              institutionId: 'SENAC',
            }
          ]
        }
      ]
    },
    {
      id: '3',
      type: 'SECTOR',
      name: 'Diretoria Executiva Sesc RJ',
      level: 'EXECUTIVE_DIRECTION',
      responsibleName: 'Diretor Sesc',
      responsibleEmail: 'diretoria@rj.sesc.br',
      institutionId: 'SESC',
      children: [
        {
          id: '31',
          type: 'SECTOR',
          name: 'Gerência de Cultura',
          level: 'MANAGEMENT',
          responsibleName: 'Gestor Cultura',
          responsibleEmail: 'cultura@rj.sesc.br',
          institutionId: 'SESC',
        }
      ]
    }
  ]
};

export const ODS_DATA: Record<ODS, { title: string; color: string; imageUrl: string }> = {
  '1': { title: 'Erradicação da Pobreza', color: '#E5243B', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/SDG_01.svg/120px-SDG_01.svg.png' },
  '2': { title: 'Fome Zero e Agricultura Sustentável', color: '#DDA63A', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/SDG_02.svg/120px-SDG_02.svg.png' },
  '3': { title: 'Saúde e Bem-Estar', color: '#4C9F38', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/SDG_03.svg/120px-SDG_03.svg.png' },
  '4': { title: 'Educação de Qualidade', color: '#C5192D', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/SDG_04.svg/120px-SDG_04.svg.png' },
  '5': { title: 'Igualdade de Gênero', color: '#FF3A21', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/SDG_05.svg/120px-SDG_05.svg.png' },
  '6': { title: 'Água Potável e Saneamento', color: '#26BDE2', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/SDG_06.svg/120px-SDG_06.svg.png' },
  '7': { title: 'Energia Limpa e Acessível', color: '#FCC30B', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/SDG_07.svg/120px-SDG_07.svg.png' },
  '8': { title: 'Trabalho Decente e Crescimento Econômico', color: '#A21942', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/SDG_08.svg/120px-SDG_08.svg.png' },
  '9': { title: 'Indústria, Inovação e Infraestrutura', color: '#FD6925', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/SDG_09.svg/120px-SDG_09.svg.png' },
  '10': { title: 'Redução das Desigualdades', color: '#DD1367', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/SDG_10.svg/120px-SDG_10.svg.png' },
  '11': { title: 'Cidades e Comunidades Sustentáveis', color: '#FD9D24', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/SDG_11.svg/120px-SDG_11.svg.png' },
  '12': { title: 'Consumo e Produção Responsáveis', color: '#BF8B2E', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/SDG_12.svg/120px-SDG_12.svg.png' },
  '13': { title: 'Ação Contra a Mudança Global do Clima', color: '#3F7E44', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/SDG_13.svg/120px-SDG_13.svg.png' },
  '14': { title: 'Vida na Água', color: '#0A97D9', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/SDG_14.svg/120px-SDG_14.svg.png' },
  '15': { title: 'Vida Terrestre', color: '#56C02B', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/SDG_15.svg/120px-SDG_15.svg.png' },
  '16': { title: 'Paz, Justiça e Instituições Eficazes', color: '#00689D', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/SDG_16.svg/120px-SDG_16.svg.png' },
  '17': { title: 'Parcerias e Meios de Implementação', color: '#19486A', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/SDG_17.svg/120px-SDG_17.svg.png' },
};

export const MOCK_PROJECTS: ImpactProject[] = [
  {
    id: 'proj_1',
    title: 'NITERÓI JOVEM ECOSOCIAL',
    subtitle: 'SENAC RJ',
    institutionId: 'SENAC',
    status: 'APPROVED',
    odss: ['1', '4'],
    pillars: ['IMPACTO AMBIENTAL', 'EDUCAÇÃO TRANSFORMADORA'],
    mainGoal: 'Qualificar profissionalmente jovens de 16 a 24 anos oriundos de comunidades da cidade de Niterói com foco em empregabilidade e geração de renda, com a difusão da educação socioambiental e devolução do investimento para as comunidades participantes, com a atuação dos jovens em ações de educação ambiental, reciclagem, reflorestamento e recuperação de áreas degradadas.',
    description: 'O Programa Niterói Jovem Eco Social existe desde 2019, estando na sua terceira edição em 2024. É estruturado em 3 pilares: desenvolvimento humano, qualificação profissional e educação socioambiental.',
    context: 'O programa faz parte do ecossistema de ações da Prefeitura de Niterói contra a violência e a favor da paz. Possui abrangência total do município de Niterói, já tendo atendido 1500 alunos nas outras edições e mais de 46 comunidades.',
    challenges: 'O programa é desafiador devido ao seu tamanho e duração, já que são 600 alunos acompanhados durante 18 meses. É fundamental garantir a permanência dos alunos no programa, evitando a evasão e, ao final, inserir os participantes no mercado de trabalho.',
    responsibleName: 'Patrick Costa',
    responsibleEmail: 'patrick.costa@rj.senac.br',
    responsibleAvatar: 'https://ui-avatars.com/api/?name=Patrick+Costa&background=0D8ABC&color=fff',
    beneficiariesText: '600 jovens de 16 a 24 anos, sem restrição de gênero, com renda familiar entre 1 a 2 salários mínimos, oriundos de 20 comunidades da cidade de Niterói.',
    locationText: '20 comunidades de Niterói',
    accessType: 'Acesso gratuito',
    investmentAmount: 'R$ 27,9 milhões',
    fundingSource: 'Prefeitura de Niterói - Secretaria de Participação Social',
    metrics: [
        'Evasão - Quantidade de alunos evadidos e/ou que desistiram',
        '% de execução do projeto - Qual fase o projeto está e qual a quantidade de turmas executadas',
        'Custo - Orçado x Realizado'
    ]
  }
];
