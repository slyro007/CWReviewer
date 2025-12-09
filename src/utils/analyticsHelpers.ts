import type {
  ConnectWiseTimeEntry,
  TimeEntryGrouped,
  ProjectContribution,
  EmployeeMetrics,
  ComparisonData,
} from '../types';

export function groupTimeEntriesByBoard(
  entries: ConnectWiseTimeEntry[],
  boards: Map<number, string>
): TimeEntryGrouped[] {
  const grouped = new Map<number, ConnectWiseTimeEntry[]>();

  entries.forEach((entry) => {
    // For time entries, we need to get board from ticket
    // This is a simplified version - in reality, you'd need to fetch ticket details
    const boardId = entry.chargeToId || 0;
    if (!grouped.has(boardId)) {
      grouped.set(boardId, []);
    }
    grouped.get(boardId)!.push(entry);
  });

  return Array.from(grouped.entries()).map(([boardId, entries]) => ({
    boardId,
    boardName: boards.get(boardId) || `Board ${boardId}`,
    totalHours: entries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0),
    entries,
  }));
}

export function groupTimeEntriesByProject(
  entries: ConnectWiseTimeEntry[]
): ProjectContribution[] {
  const grouped = new Map<number, ConnectWiseTimeEntry[]>();

  entries.forEach((entry) => {
    if (entry.projectId) {
      if (!grouped.has(entry.projectId)) {
        grouped.set(entry.projectId, []);
      }
      grouped.get(entry.projectId)!.push(entry);
    }
  });

  return Array.from(grouped.entries()).map(([projectId, entries]) => ({
    projectId,
    projectName: `Project ${projectId}`, // Will be updated with actual project data
    totalHours: entries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0),
    entries,
  }));
}

export function calculateEmployeeMetrics(
  memberId: number,
  memberName: string,
  timeEntries: ConnectWiseTimeEntry[],
  projects: ProjectContribution[],
  averageNoteQuality: number
): EmployeeMetrics {
  const uniqueProjects = new Set(
    timeEntries.filter((e) => e.projectId).map((e) => e.projectId!)
  );
  const uniqueTickets = new Set(
    timeEntries.filter((e) => e.ticketId).map((e) => e.ticketId!)
  );

  return {
    memberId,
    memberName,
    totalHours: timeEntries.reduce((sum, entry) => sum + (entry.actualHours || 0), 0),
    totalProjects: uniqueProjects.size,
    totalTickets: uniqueTickets.size,
    averageNoteQuality,
    timeEntries,
    projects,
    notes: [], // Will be populated separately
  };
}

export function calculateComparisonMetrics(
  employees: EmployeeMetrics[]
): ComparisonData['comparisonMetrics'] {
  if (employees.length === 0) {
    return {
      averageHours: 0,
      averageProjects: 0,
      averageNoteQuality: 0,
    };
  }

  const totalHours = employees.reduce((sum, e) => sum + e.totalHours, 0);
  const totalProjects = employees.reduce((sum, e) => sum + e.totalProjects, 0);
  const totalQuality = employees.reduce((sum, e) => sum + e.averageNoteQuality, 0);

  return {
    averageHours: totalHours / employees.length,
    averageProjects: totalProjects / employees.length,
    averageNoteQuality: totalQuality / employees.length,
  };
}

export function findHighlights(metrics: EmployeeMetrics): {
  highestHours: number;
  mostProjects: number;
  bestNoteQuality: number;
  trends: {
    improving: boolean;
    declining: boolean;
  };
} {
  // This is a simplified version - in reality, you'd analyze trends over time
  return {
    highestHours: metrics.totalHours,
    mostProjects: metrics.totalProjects,
    bestNoteQuality: metrics.averageNoteQuality,
    trends: {
      improving: metrics.averageNoteQuality > 60, // Simplified
      declining: metrics.averageNoteQuality < 40, // Simplified
    },
  };
}

