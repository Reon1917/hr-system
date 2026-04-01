import { auditLog } from "@/db/schema/hr";
import { db } from "@/lib/db";

type AuditPayload = {
  actorUserId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  reason?: string | null;
  beforeJson?: Record<string, unknown> | null;
  afterJson?: Record<string, unknown> | null;
  metadataJson?: Record<string, unknown> | null;
};

export async function writeAuditLog(payload: AuditPayload) {
  await db.insert(auditLog).values({
    id: crypto.randomUUID(),
    actorUserId: payload.actorUserId,
    entityType: payload.entityType,
    entityId: payload.entityId,
    action: payload.action,
    reason: payload.reason ?? null,
    beforeJson: payload.beforeJson ?? null,
    afterJson: payload.afterJson ?? null,
    metadataJson: payload.metadataJson ?? null,
  });
}
