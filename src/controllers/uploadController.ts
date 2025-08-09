import multer from 'multer';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const storagePath = path.join(__dirname, '../../public/data/uploads/');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Make sure destination exists before writing to it
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
    cb(null, storagePath);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
});

const uploadFile = [
  upload.single('uploaded_file'),
  (req: Request, res: Response) => {
    console.log(req.file, req.body);
    res.redirect('/');
  },
];

export default { uploadFile };
