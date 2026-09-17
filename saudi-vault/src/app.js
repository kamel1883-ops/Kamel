import express from 'express';
import fs from 'fs';
import { config } from './config.js';
import { requireApiKey, safeRequestLog, errorHandler } from './middleware/index.js';
import employeesRouter from './routes/employees.js';
import documentsRouter from './routes/documents.js';
import payrollRouter from './routes/payroll.js';

fs.mkdirSync(config.storageDir, { recursive: true });

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));
app.use(safeRequestLog);

// فحص صحة — بدون مصادقة
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// مسارات البيانات الحساسة — محمية بمفتاح API
app.use('/api/vault/employees', requireApiKey, employeesRouter);
app.use('/api/vault/payroll', requireApiKey, payrollRouter);
// المسارات داخل documents router تحدد requireApiKey بنفسها (التنزيل عام بالرمز)
app.use('/api/vault/documents', documentsRouter);

app.use(errorHandler);

export default app;