import { prisma } from './prisma';

export interface IncidentRecord {
  id: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  affectedSystem: string;
  rootCause: string | null;
  resolution: string | null;
  startedAt: Date;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Fetch all incidents with optional status filter
 */
export async function getIncidents(statusFilter?: string): Promise<IncidentRecord[]> {
  const where = statusFilter && statusFilter !== 'ALL' ? { status: statusFilter } : {};
  const incidents = await prisma.incident.findMany({
    where,
    orderBy: { startedAt: 'desc' },
  });

  return incidents as IncidentRecord[];
}

/**
 * Register a new operational incident
 */
export async function createIncident(data: {
  title: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedSystem: string;
  rootCause?: string;
}): Promise<IncidentRecord> {
  const incident = await prisma.incident.create({
    data: {
      title: data.title,
      severity: data.severity || 'MEDIUM',
      status: 'OPEN',
      affectedSystem: data.affectedSystem,
      rootCause: data.rootCause || null,
      startedAt: new Date(),
    },
  });

  return incident as IncidentRecord;
}

/**
 * Update incident status, root cause, and resolution
 */
export async function updateIncident(
  id: string,
  update: {
    status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    rootCause?: string;
    resolution?: string;
  }
): Promise<IncidentRecord> {
  const data: any = { ...update };
  if (update.status === 'RESOLVED' || update.status === 'CLOSED') {
    data.resolvedAt = new Date();
  }

  const updated = await prisma.incident.update({
    where: { id },
    data,
  });

  return updated as IncidentRecord;
}

/**
 * Get incident statistics for dashboard summary
 */
export async function getIncidentSummary(): Promise<{
  total: number;
  openCount: number;
  investigatingCount: number;
  resolvedCount: number;
  criticalCount: number;
}> {
  const incidents = await prisma.incident.findMany();
  const openCount = incidents.filter((i) => i.status === 'OPEN').length;
  const investigatingCount = incidents.filter((i) => i.status === 'INVESTIGATING').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL' && (i.status === 'OPEN' || i.status === 'INVESTIGATING')).length;

  return {
    total: incidents.length,
    openCount,
    investigatingCount,
    resolvedCount,
    criticalCount,
  };
}
