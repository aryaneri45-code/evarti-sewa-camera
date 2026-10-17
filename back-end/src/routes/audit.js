import { Router } from 'express';

export function createAuditRouter({ db }) {
  const router = Router();
  router.get('/', (request, response, next) => {
    try {
      const limit = Math.min(Math.max(Number.parseInt(request.query.limit || '50', 10) || 50, 1), 100);
      const rows = db.prepare(`
        SELECT logs.id, logs.action, logs.transaction_id, logs.detail, logs.created_at,
          users.username AS actor_id, users.name AS actor_name
        FROM audit_logs logs JOIN users ON users.id = logs.user_id
        ORDER BY logs.created_at DESC LIMIT ?
      `).all(limit);
      return response.json({
        logs: rows.map((row) => ({
          id: row.id,
          action: row.action,
          transactionId: row.transaction_id,
          detail: row.detail,
          createdAt: row.created_at,
          actorId: row.actor_id,
          actorName: row.actor_name,
        })),
      });
    } catch (error) {
      return next(error);
    }
  });
  return router;
}
