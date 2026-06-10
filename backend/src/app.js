import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import adminRouter from './routes/admin.routes.js';
import employeeRouter from './routes/employee.routes.js';
import payrollRouter from './routes/payroll.routes.js';
import branchRouter from './routes/branch.routes.js';

const app = express();

const isDev = process.env.NODE_ENV !== "production";
const allowedOrigins = String(process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: isDev
    ? true
    : (origin, callback) => {
        if (!origin) return callback(null, true);
        if (!allowedOrigins.length) return callback(null, false);
        return callback(null, allowedOrigins.includes(origin));
      },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
  if (req.method !== "OPTIONS") return next();
  return cors(corsOptions)(req, res, () => res.sendStatus(204));
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Test root (IMPORTANT)
app.get("/", (req, res) => {
  res.json({ status: "API running 🚀" });
});

app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/employees', employeeRouter);
app.use('/api/v1/payroll', payrollRouter);
app.use('/api/v1/branches', branchRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    console.error(`[ERROR] ${statusCode} - ${message}`, err.stack || '');

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
        data: err.data || null,
    });
});

export { app };
