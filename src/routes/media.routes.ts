import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import { sendSuccess, sendError } from '../utils/response';

const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedExt = /\.(jpe?g|png|gif|webp|svg|pdf)$/i;
    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    const isPdf = file.mimetype === 'application/pdf';
    const extOk = allowedExt.test(file.originalname);
    if ((isImage || isPdf) && extOk) return cb(null, true);
    cb(new Error('Only image and PDF files allowed'));
  },
});

const router = Router();

router.post('/upload', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) {
    return sendError(res, 'No file uploaded', 400);
  }
  const file = req.file as any;
  sendSuccess(res, {
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
  }, 'File uploaded', 201);
});

router.post('/upload-multiple', authenticate, upload.array('files', 10), (req, res) => {
  const files = req.files as any[];
  if (!files || files.length === 0) {
    return sendError(res, 'No files uploaded', 400);
  }
  sendSuccess(res, files.map((f) => ({
    url: `/uploads/${f.filename}`,
    filename: f.filename,
    size: f.size,
    mimetype: f.mimetype,
  })), 'Files uploaded', 201);
});

export default router;
