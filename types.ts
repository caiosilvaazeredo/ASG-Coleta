
export type InstitutionId = 'SENAC' | 'SESC' | 'FECOMERCIO' | 'IFS' | 'IFEC' | 'GROUP';

export interface Institution {
  id: InstitutionId;
  name: string;
  fullName: string;
  color: string; // The specific bg class for the logo (e.g. bg-orange-500)
  theme: string; // The color name for generating dynamic palettes (e.g. 'orange', 'blue', 'green')
  logoInitial: string;
}

export type GRIDimension = 'Governance' | 'Economic' | 'Environmental' | 'Social';
export type FrameworkType = 'GRI' | 'ETHOS';

// --- NEW HIERARCHY STRUCTURE (RF Update) ---

export type ODS = 
  | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' 
  | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17';

export type QuestionType = 'TEXT_SHORT' | 'TEXT_LONG' | 'NUMBER' | 'DATE' | 'FILE' | 'SELECT_SINGLE' | 'SELECT_MULTI' | 'TABLE';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: string[]; // For SELECT types
  columns?: string[]; // For TABLE type (Defined headers)
  description?: string; // Help text
}

export interface GRIContent {
  id: string;
  code: string; // e.g., "201-1"
  title: string; // e.g., "Valor econômico direto gerado..."
  description?: string;
  questions: Question[];
}

export interface GRINotebook {
  id: string;
  title: string; // e.g., "GRI 201: Desempenho Econômico"
  contents: GRIContent[];
}

export interface Pillar {
  id: string;
  title: string; // e.g., "Ambiental" or "Estratégia Corporativa"
  odss: ODS[];
  notebooks: GRINotebook[];
}

// ---------------------------------------------

export interface GRIIndicator {
  code: string;
  title: string;
  dimension: GRIDimension;
  framework?: FrameworkType; // Added framework support
  description: string;
  materialityScore: number; // 1-5
  questions?: Question[]; // Added specific questions for this indicator
}

// The 4 Innovative Response Options (RF006)
export type ResponseOptionType = 'ANSWER_NOW' | 'DELEGATE' | 'NOT_MY_AREA' | 'NO_DATA';

export interface ScoringCriteria {
  hasNumericData: boolean;
  hasTemporalComparison: boolean;
  hasExternalVerification: boolean;
  hasHistoricSeries: boolean;
}

// NEW: Support for multi-department contributions
export interface Contribution {
  userId: string;
  userName: string;
  department: string;
  answers: Record<string, any>; // Map questionID to value
  lastUpdated: string;
  status: 'DRAFT' | 'SUBMITTED';
}

export interface GRIResponse {
  indicatorCode: string;
  option: ResponseOptionType;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'GAP_OPEN' | 'GAP_RESOLVED' | 'CHANGES_REQUESTED';
  
  // Spreadsheet Management Fields
  assignedUserId?: string; // ID of the person responsible (Owner)
  contributors?: string[]; // IDs of other users invited to contribute
  deadline?: string; // ISO Date string
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';

  // Option 1 Fields
  value?: number | string; // Legacy/Fallback single value
  answers?: Record<string, any>; // The Consolidated/Official Answers
  contributions?: Contribution[]; // NEW: List of answers from other areas
  
  periodStart?: string;
  periodEnd?: string;
  periodJustification?: string; // NEW: Justification for partial period
  evidenceFiles?: string[];
  // Option 2 Fields
  delegatedTo?: string; // Legacy text field, preferring assignedUserId now
  delegationReason?: string;
  // Option 3 Fields
  rejectionReason?: string;
  suggestedArea?: string;
  // Option 4 (Gap) Fields
  gapReason?: string;
  gapType?: 'NEVER_MEASURED' | 'DISPERSED_DATA' | 'SYSTEM_LIMITATION' | 'THIRD_PARTY';
  estimatedResolutionDate?: string;
  actionPlan?: string;
  
  // RF007 - Skouloudis Scoring
  skouloudisScore?: number; // 0-4
  scoringCriteria?: ScoringCriteria;
  
  lastUpdated: string;
  feedback?: string; // Feedback from superior
}

export interface KPIMetric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface GapSummary {
  id: string;
  indicatorCode: string;
  title: string; // Added title for better UI
  department: string;
  responsible: string; // Added responsible for RF008.2
  daysToDeadline: number;
  criticality: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Notification Types
export type NotificationType = 
  | 'DELEGATION'    // RF006.3
  | 'DEADLINE'      // RF005.2
  | 'GAP_REMINDER'  // RF008.2
  | 'ANOMALY'       // RF011.1
  | 'APPROVAL';     // RF005.1

export interface NotificationAction {
  label: string;
  actionId: string;
  style: 'primary' | 'secondary' | 'danger' | 'success';
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  actions?: NotificationAction[];
  meta?: {
    indicatorCode?: string;
    department?: string;
    targetId?: string;
  };
}

// Hierarchy Types (RF001.2)
export type HierarchyLevel = 'PRESIDENCY' | 'EXECUTIVE_DIRECTION' | 'MANAGEMENT' | 'OPERATIONAL_SECTOR' | 'STAFF';

export interface HierarchyNode {
  id: string;
  type: 'SECTOR' | 'PERSON';
  name: string; // e.g., "Gerência de TI" or "João Silva"
  role?: string; // e.g. "Gerente" or "Analista"
  level: HierarchyLevel;
  responsibleName?: string; // For SECTOR
  responsibleEmail?: string; // For SECTOR or PERSON
  institutionId?: InstitutionId; // If specific to one, otherwise 'GROUP'
  children?: HierarchyNode[];
  avatarUrl?: string;
}

// User & Access Management Types (RF002)
export type UserRole = 
  | 'PRESIDENT' 
  | 'EXECUTIVE_DIRECTOR' 
  | 'ASG_MANAGER' 
  | 'AREA_COORDINATOR' 
  | 'INTERNAL_AUDITOR' 
  | 'EXTERNAL_CONSULTANT';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  department?: string;
  // Which institutions this user can access
  allowedInstitutions: InstitutionId[]; 
  // For role-based display logic
  permissions: {
    canEdit: boolean;
    canApprove: boolean;
    canViewConsolidated: boolean;
    canConfigure: boolean;
  };
}

// New Interface for Respondent Management
export interface Respondent {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  lastAccess: string;
  indicatorsAssigned: number;
  indicatorsCompleted: number;
  avatarInitials: string;
}

// --- NEW PROJECT TYPE ---
export type ProjectStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'CHANGES_REQUESTED';

export interface ImpactProject {
  id: string;
  title: string;
  subtitle: string;
  institutionId: InstitutionId;
  status: ProjectStatus;
  
  odss: ODS[];
  pillars: string[];
  
  // Left Column Content
  mainGoal: string; // "Qualificar profissionalmente..."
  description: string; // "O Programa Niterói Jovem..."
  context: string; // "O programa faz parte do ecossistema..."
  challenges: string; // "O programa é desafiador..."

  // Right Column Content (Card)
  responsibleName: string;
  responsibleEmail: string;
  responsibleAvatar?: string;
  
  beneficiariesText: string;
  locationText: string;
  accessType: string; // "Acesso gratuito"
  
  investmentAmount: string;
  fundingSource: string; // "Prefeitura de Niterói..."
  
  metrics: string[]; // List of metrics like "Evasão", "% de execução"

  // Workflow meta
  lastUpdated?: string;
  feedback?: string;
}
