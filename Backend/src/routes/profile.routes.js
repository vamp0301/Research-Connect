import express from 'express';
import multer from 'multer';
import path from 'path';
import * as profileController from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateProfileUpdate } from '../validations/user.validation.js';

// Configure Multer Storage for file uploads
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
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, jpeg, png, webp) are allowed!'));
  },
});

const router = express.Router();

// Apply protect middleware to all profile routes
router.use(protect);

router.get('/me', profileController.getMyProfile);
router.put('/', validateProfileUpdate, profileController.updateProfile);

// Google Scholar Integration Routes
router.get('/google-scholar/preview', profileController.previewGoogleScholar);
router.post('/google-scholar/import', profileController.importGoogleScholar);
router.put('/google-scholar/sync', profileController.syncGoogleScholar);
router.delete('/google-scholar/unlink', profileController.unlinkGoogleScholar);
router.post('/google-scholar/refresh', profileController.refreshGoogleScholar);

router.post('/photo', upload.single('photo'), profileController.uploadPhoto);
router.post('/cover', upload.single('cover'), profileController.uploadPhoto);

export default router;
