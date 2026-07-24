// Shared helper for the Activity Log feature. Best-effort, fire-and-forget
// semantics — a logging failure must never break the actual mutation it's
// recording (same pattern this codebase already uses for email sends).
export async function logActivity({ user, action, details }) {
  try {
    const { prisma } = await import("@/lib/database/prisma");
    await prisma.adminActivityLog.create({
      data: {
        userId: user?.id || null,
        userEmail: user?.email || "unknown",
        userName: user?.name || null,
        action,
        details: details || null,
      },
    });
  } catch (err) {
    console.error("[activityLog] failed to record activity:", action, err?.message || err);
  }
}
