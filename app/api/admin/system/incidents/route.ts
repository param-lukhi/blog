import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import { getIncidents, createIncident, updateIncident, getIncidentSummary } from '@/lib/incidentManager';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status') || undefined;

  try {
    const [incidents, summary] = await Promise.all([
      getIncidents(statusFilter),
      getIncidentSummary(),
    ]);

    return NextResponse.json({
      incidents,
      summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await req.json();
    if (!body.title || !body.affectedSystem) {
      return NextResponse.json(
        { error: 'Title and affected system are required.' },
        { status: 400 }
      );
    }

    const incident = await createIncident({
      title: body.title,
      severity: body.severity,
      affectedSystem: body.affectedSystem,
      rootCause: body.rootCause,
    });

    return NextResponse.json({
      message: 'Incident registered successfully',
      incident,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create incident' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
    }

    const updated = await updateIncident(body.id, {
      status: body.status,
      severity: body.severity,
      rootCause: body.rootCause,
      resolution: body.resolution,
    });

    return NextResponse.json({
      message: 'Incident updated successfully',
      incident: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update incident' },
      { status: 500 }
    );
  }
}
