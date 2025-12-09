// ConnectWise API Types
export interface ConnectWiseMember {
  id: number;
  identifier: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface ConnectWiseTimeEntry {
  id: number;
  member: {
    id: number;
    identifier: string;
    name: string;
  };
  ticketId?: number;
  projectId?: number;
  chargeToId?: number;
  chargeToType?: string;
  timeStart: string;
  timeEnd: string;
  hoursDeduct: number;
  actualHours: number;
  billableOption: string;
  notes?: string;
  internalNotes?: string;
  dateEntered: string;
}

export interface ConnectWiseTicket {
  id: number;
  summary: string;
  board: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  priority: {
    id: number;
    name: string;
  };
  company?: {
    id: number;
    name: string;
  };
  contact?: {
    id: number;
    name: string;
  };
  dateEntered: string;
  closedDate?: string;
}

export interface ConnectWiseProject {
  id: number;
  name: string;
  description?: string;
  status: {
    id: number;
    name: string;
  };
  company: {
    id: number;
    name: string;
  };
  projectManager?: {
    id: number;
    identifier: string;
    name: string;
  };
  actualStart?: string;
  actualEnd?: string;
}

export interface ConnectWiseNote {
  id: number;
  ticketId?: number;
  projectId?: number;
  text: string;
  member: {
    id: number;
    identifier: string;
    name: string;
  };
  dateCreated: string;
  createdBy: string;
  internalFlag: boolean;
}

export interface ConnectWiseBoard {
  id: number;
  name: string;
  inactiveFlag: boolean;
}

// Application Types
export interface TimeEntryGrouped {
  boardId: number;
  boardName: string;
  totalHours: number;
  entries: ConnectWiseTimeEntry[];
}

export interface ProjectContribution {
  projectId: number;
  projectName: string;
  totalHours: number;
  entries: ConnectWiseTimeEntry[];
  project?: ConnectWiseProject;
}

export interface NoteQualityScore {
  noteId: number;
  lengthScore: number;
  detailScore: number;
  structureScore: number;
  keywordScore: number;
  overallScore: number;
  manualRating?: number;
  manualComments?: string;
}

export interface EmployeeMetrics {
  memberId: number;
  memberName: string;
  totalHours: number;
  totalProjects: number;
  totalTickets: number;
  averageNoteQuality: number;
  timeEntries: ConnectWiseTimeEntry[];
  projects: ProjectContribution[];
  notes: (ConnectWiseNote & { qualityScore?: NoteQualityScore })[];
}

export interface ComparisonData {
  employees: EmployeeMetrics[];
  comparisonMetrics: {
    averageHours: number;
    averageProjects: number;
    averageNoteQuality: number;
  };
}

export interface PerformanceRating {
  criterion: string;
  rating: 'Needs Work' | 'Meets Expectations' | 'Good' | 'Exceeds Expectations';
  evidence: string[];
  score: number; // 1-4
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'word' | 'json';
  dateRange?: {
    start: string;
    end: string;
  };
  includeSections: {
    timeEntries: boolean;
    projects: boolean;
    notes: boolean;
    metrics: boolean;
    comparisons: boolean;
    review: boolean;
  };
}

