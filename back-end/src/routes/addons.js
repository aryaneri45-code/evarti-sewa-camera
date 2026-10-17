import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { HttpError, notFound } from '../utils/errors.js';

const addonUpdate = z.object({
  addons: z.array(z.object({
    id: z.string().min(1),
    label: z.string().trim().min(1).max(100),
    price: z.number().int().min(0).max(100_000_000),
    active: z.boolean(),
    category: z.enum(['property', 'photographer', 'print', 'transfer']),
  }).strict()).max(100),
}).strict();
const addonInput = z.object({
  category: z.enum(['property', 'photographer', 'print', 'transfer']),
  label: z.string().trim().min(1).max(100),
  price: z.number().int().min(0).max(100_000_000),
}).strict();

function serializeAddon(addon) {
  return {
    id: addon.id,
    category: addon.category,
    label: addon.label,
    price: addon.price,
    active: Boolean(addon.active),
  };
}

export function createAddonsRouter({ db }) {
  const router = Router();

  router.get('/', (request, response, next) => {
    try {
      const addons = db.prepare(
        'SELECT * FROM addons WHERE active = 1 OR ? = 1 ORDER BY rowid',
      ).all(request.user.role === 'owner' ? 1 : 0);
      return response.json({ addons: addons.map(serializeAddon) });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/', (request, response, next) => {
    try {
      const parsed = addonInput.safeParse(request.body);
      if (!parsed.success) throw new HttpError(400, 'Data add-on tidak valid.', 'VALIDATION_ERROR');
      const id = `custom-${randomUUID()}`;
      db.prepare('INSERT INTO addons (id, category, label, price, active) VALUES (?, ?, ?, ?, 1)')
        .run(id, parsed.data.category, parsed.data.label, parsed.data.price);
      return response.status(201).json({
        addon: serializeAddon(db.prepare('SELECT * FROM addons WHERE id = ?').get(id)),
      });
    } catch (error) {
      return next(error);
    }
  });

  router.delete('/:id', (request, response, next) => {
    try {
      const result = db.prepare('DELETE FROM addons WHERE id = ?').run(request.params.id);
      if (result.changes === 0) throw notFound('Add-on tidak ditemukan.');
      return response.status(204).end();
    } catch (error) {
      return next(error);
    }
  });

  router.put('/', (request, response, next) => {
    try {
      const parsed = addonUpdate.safeParse(request.body);
      if (!parsed.success) {
        throw new HttpError(400, 'Data katalog add-on tidak valid.', 'VALIDATION_ERROR');
      }
      const existing = db.prepare('SELECT id, category FROM addons ORDER BY rowid').all();
      const requested = parsed.data.addons.map(({ id }) => id);
      const categories = new Map(existing.map(({ id, category }) => [id, category]));
      if (new Set(requested).size !== requested.length
        || existing.some(({ id }) => !requested.includes(id))
        || parsed.data.addons.some((addon) => categories.get(addon.id) !== addon.category)) {
        throw new HttpError(400, 'Semua pilihan add-on katalog harus disertakan tepat satu kali.', 'VALIDATION_ERROR');
      }
      const updateAddon = db.prepare(
        'UPDATE addons SET label = ?, price = ?, active = ?, updated_at = ? WHERE id = ?',
      );
      const updateAll = db.transaction(() => {
        for (const addon of parsed.data.addons) {
          const result = updateAddon.run(addon.label, addon.price, addon.active ? 1 : 0, new Date().toISOString(), addon.id);
          if (result.changes === 0) throw notFound('Pilihan add-on tidak ditemukan.');
        }
      });
      updateAll();
      const addons = db.prepare('SELECT * FROM addons ORDER BY rowid').all();
      return response.json({ addons: addons.map(serializeAddon) });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
