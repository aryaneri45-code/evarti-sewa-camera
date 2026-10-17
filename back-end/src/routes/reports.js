import PDFDocument from 'pdfkit';
import { Router } from 'express';
import { HttpError } from '../utils/errors.js';
import { jakartaDate, jakartaDateKey } from '../utils/transactions.js';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function reportFilters(request) {
  const conditions = ["date(t.created_at, '+7 hours') >= date(?, '-6 days')"];
  const today = jakartaDate();
  const values = [today];

  if (request.query.from || request.query.to || request.query.date) {
    const from = request.query.from || request.query.date || today;
    const to = request.query.to || request.query.date || from;
    if (!datePattern.test(from) || !datePattern.test(to) || from > to) {
      throw new HttpError(400, 'Rentang tanggal tidak valid. Gunakan format YYYY-MM-DD.', 'VALIDATION_ERROR');
    }
    conditions.length = 0;
    values.length = 0;
    conditions.push("date(t.created_at, '+7 hours') BETWEEN ? AND ?");
    values.push(from, to);
  }
  if (request.query.location && request.query.location !== 'all') {
    if (!['cafe', 'event'].includes(request.query.location)) throw new HttpError(400, 'Filter lokasi tidak valid.', 'VALIDATION_ERROR');
    conditions.push('t.location = ?');
    values.push(request.query.location);
  }
  if (request.user.role === 'owner') {
    if (request.query.cashier && request.query.cashier !== 'all') {
      if (!['kasir1', 'kasir2'].includes(request.query.cashier)) throw new HttpError(400, 'Filter kasir tidak valid.', 'VALIDATION_ERROR');
      conditions.push('u.username = ?');
      values.push(request.query.cashier);
    }
  } else {
    conditions.push('t.cashier_id = ?');
    values.push(request.user.id);
  }
  return { where: `WHERE ${conditions.join(' AND ')}`, values, from: values[0], to: values[1] };
}

export function createReportsRouter({ db }) {
  const router = Router();

  router.get('/summary', (request, response, next) => {
    try {
      const filters = reportFilters(request);
      const today = jakartaDate();
      const defaultFromDate = new Date(`${today}T00:00:00.000Z`);
      defaultFromDate.setUTCDate(defaultFromDate.getUTCDate() - 6);
      const totals = db.prepare(`
        SELECT COUNT(*) AS transaction_count,
          SUM(CASE WHEN t.payment_status = 'paid' THEN 1 ELSE 0 END) AS paid_count,
          SUM(CASE WHEN t.payment_status = 'pending_verification' THEN 1 ELSE 0 END) AS pending_count,
          SUM(CASE WHEN t.payment_status = 'void' THEN 1 ELSE 0 END) AS void_count,
          SUM(CASE WHEN t.payment_status = 'paid' THEN t.total ELSE 0 END) AS revenue,
          SUM(CASE WHEN t.payment_status = 'paid' AND t.payment_method = 'cash' THEN t.total ELSE 0 END) AS cash_revenue,
          SUM(CASE WHEN t.payment_status = 'paid' AND t.payment_method = 'qris_dana' THEN t.total ELSE 0 END) AS qris_revenue,
          SUM(CASE WHEN t.is_manual_price = 1 THEN 1 ELSE 0 END) AS manual_price_count
        FROM transactions t JOIN users u ON u.id = t.cashier_id ${filters.where}
      `).get(...filters.values);
      const byLocation = db.prepare(`
        SELECT t.location, COUNT(*) AS transaction_count,
          SUM(CASE WHEN t.payment_status = 'paid' THEN t.total ELSE 0 END) AS revenue
        FROM transactions t JOIN users u ON u.id = t.cashier_id ${filters.where}
        GROUP BY t.location ORDER BY t.location
      `).all(...filters.values);
      const byCashier = db.prepare(`
        SELECT u.username AS cashier_id, u.name AS cashier_name, COUNT(*) AS transaction_count,
          SUM(CASE WHEN t.payment_status = 'paid' THEN t.total ELSE 0 END) AS revenue
        FROM transactions t JOIN users u ON u.id = t.cashier_id ${filters.where}
        GROUP BY u.id ORDER BY revenue DESC
      `).all(...filters.values);
      const popularCameras = db.prepare(`
        SELECT i.camera_id, i.camera_name, COUNT(*) AS rental_count,
          SUM(i.price) AS revenue
        FROM transactions t JOIN users u ON u.id = t.cashier_id
        JOIN transaction_items i ON i.transaction_id = t.id
        ${filters.where} AND t.payment_status = 'paid'
        GROUP BY i.camera_id, i.camera_name
        ORDER BY rental_count DESC, revenue DESC LIMIT 5
      `).all(...filters.values);
      const trend = db.prepare(`
        SELECT date(t.created_at, '+7 hours') AS date,
          COUNT(*) AS transaction_count,
          SUM(CASE WHEN t.payment_status = 'paid' THEN t.total ELSE 0 END) AS revenue
        FROM transactions t JOIN users u ON u.id = t.cashier_id ${filters.where}
        GROUP BY date(t.created_at, '+7 hours') ORDER BY date
      `).all(...filters.values);
      return response.json({
        period: {
          from: request.query.from || request.query.date || defaultFromDate.toISOString().slice(0, 10),
          to: request.query.to || request.query.date || today,
        },
        totals: {
          transactionCount: totals.transaction_count || 0,
          paidCount: totals.paid_count || 0,
          pendingCount: totals.pending_count || 0,
          voidCount: totals.void_count || 0,
          manualPriceCount: totals.manual_price_count || 0,
          revenue: totals.revenue || 0,
          paymentMethods: {
            cash: totals.cash_revenue || 0,
            qrisDana: totals.qris_revenue || 0,
          },
        },
        byLocation: byLocation.map((item) => ({
          location: item.location,
          transactionCount: item.transaction_count,
          revenue: item.revenue || 0,
        })),
        byCashier: byCashier.map((item) => ({
          cashierId: item.cashier_id,
          cashierName: item.cashier_name,
          transactionCount: item.transaction_count,
          revenue: item.revenue || 0,
        })),
        popularCameras: popularCameras.map((item) => ({
          cameraId: item.camera_id,
          cameraName: item.camera_name,
          rentalCount: item.rental_count,
          revenue: item.revenue || 0,
        })),
        trend: trend.map((item) => ({
          date: item.date,
          transactionCount: item.transaction_count,
          revenue: item.revenue || 0,
        })),
      });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/summary/pdf', (request, response, next) => {
    try {
      const filters = reportFilters(request);
      const summary = db.prepare(`
        SELECT COUNT(*) AS transaction_count,
          SUM(CASE WHEN t.payment_status = 'paid' THEN t.total ELSE 0 END) AS revenue,
          SUM(CASE WHEN t.payment_status = 'paid' AND t.payment_method = 'cash' THEN t.total ELSE 0 END) AS cash_revenue,
          SUM(CASE WHEN t.payment_status = 'paid' AND t.payment_method = 'qris_dana' THEN t.total ELSE 0 END) AS qris_revenue
        FROM transactions t JOIN users u ON u.id = t.cashier_id ${filters.where}
      `).get(...filters.values);
      const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: 'Ringkasan Transaksi Evarti' } });
      response.setHeader('Content-Type', 'application/pdf');
      response.setHeader('Content-Disposition', 'attachment; filename="evarti-ringkasan-transaksi.pdf"');
      doc.on('error', next);
      doc.pipe(response);
      doc.fontSize(22).text('Evarti Rental', { continued: false });
      doc.moveDown(0.4).fontSize(11).fillColor('#695b61').text('Ringkasan Transaksi');
      doc.moveDown(0.3).text(`Periode: ${request.query.from || request.query.date || '7 hari terakhir'} s/d ${request.query.to || request.query.date || jakartaDate()}`);
      if (request.query.location && request.query.location !== 'all') doc.text(`Lokasi: ${request.query.location === 'cafe' ? 'Cafe' : 'Event'}`);
      if (request.query.cashier && request.query.cashier !== 'all') doc.text(`Kasir: ${request.query.cashier}`);
      doc.moveDown().fillColor('#352d31').fontSize(13).text(`Jumlah transaksi: ${summary.transaction_count || 0}`);
      doc.moveDown(0.35).text(`Pendapatan lunas: Rp ${(summary.revenue || 0).toLocaleString('id-ID')}`);
      doc.moveDown(0.35).fontSize(11).text(`Tunai: Rp ${(summary.cash_revenue || 0).toLocaleString('id-ID')}`);
      doc.moveDown(0.25).text(`QRIS DANA: Rp ${(summary.qris_revenue || 0).toLocaleString('id-ID')}`);
      doc.moveDown(2).fillColor('#8d7f85').fontSize(8).text('Dokumen ringkasan internal Evarti.');
      doc.end();
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
