import express from 'express';
import multer from 'multer';
import path from 'path';
import * as publicationController from '../controllers/publication.controller.js';
import { protect } from '../middleware/auth.middleware.js';

// Configure Multer storage for local fallback
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit for PDFs / ZIP datasets
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|zip|rar|tar|gz|jpeg|jpg|png|webp|csv|xlsx|txt/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Uploaded file type is not supported!'));
  },
});

const router = express.Router();

// Apply protect middleware to routes requiring auth
router.use(protect);

// Main publication search & CRUD
router.get('/', publicationController.searchPublications);
router.get('/my', publicationController.getMyPublications);
router.post('/', publicationController.createPublication);
router.get('/doi/:doi', publicationController.resolveDoi);

router.get('/:id', publicationController.getPublicationDetails);
router.put('/:id', publicationController.updatePublication);
router.delete('/:id', publicationController.deletePublication);

// Version history
router.get('/:id/versions', publicationController.getVersionHistory);
router.post('/:id/rollback', publicationController.rollbackVersion);

// Files
router.post('/upload', upload.single('file'), publicationController.uploadFile);
router.delete('/files/:fileId', publicationController.removeFile);
router.get('/download/:fileId', publicationController.downloadFile);

// Comments
router.get('/:id/comments', publicationController.getComments);
router.post('/:id/comments', publicationController.addComment);

export default router;
