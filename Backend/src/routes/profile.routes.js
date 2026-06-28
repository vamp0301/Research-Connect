import express from 'express';
import multer from 'multer';
import path from 'path';
import * as profileController from '../controllers/profile.controller.js';
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, jpeg, png, webp) and PDFs are allowed!'));
  },
});

const router = express.Router();

// All profile routes require authentication
router.use(protect);

// Basic Profile Details
router.get('/me', profileController.getMyProfile);
router.get('/user/:id', profileController.getProfileByUserId);
router.put('/', profileController.updateProfile);
router.get('/completion', profileController.getProfileCompletion);

// Image Uploads
router.post('/photo', upload.single('photo'), profileController.uploadPhoto);
router.post('/cover', upload.single('cover'), profileController.uploadPhoto);

// Education
router.post('/education', profileController.addEducation);
router.put('/education/:id', profileController.updateEducation);
router.delete('/education/:id', profileController.deleteEducation);

// Experience
router.post('/experience', profileController.addExperience);
router.put('/experience/:id', profileController.updateExperience);
router.delete('/experience/:id', profileController.deleteExperience);

// Awards
router.post('/awards', profileController.addAward);
router.put('/awards/:id', profileController.updateAward);
router.delete('/awards/:id', profileController.deleteAward);

// Certifications
router.post('/certifications', profileController.addCertification);
router.put('/certifications/:id', profileController.updateCertification);
router.delete('/certifications/:id', profileController.deleteCertification);

// Google Scholar Sync
router.post('/scholar/connect', profileController.connectGoogleScholar);
router.post('/scholar/sync', profileController.syncGoogleScholar);
router.get('/scholar/status', profileController.getGoogleScholarStatus);
router.get('/google-scholar/preview', profileController.previewGoogleScholar);
router.post('/google-scholar/import', profileController.importGoogleScholar);

// Connect external identities
router.post('/orcid', profileController.connectOrcid);
router.post('/google-scholar', profileController.connectGoogleScholar);
router.post('/scopus', profileController.connectScopus);
router.post('/researchgate', profileController.connectResearchGate);
router.post('/sync-google-scholar', profileController.syncGoogleScholar);
router.get('/metrics', profileController.getResearchMetrics);

// Social follows & share
router.post('/follow', profileController.followResearcherDirect);
router.post('/unfollow', profileController.unfollowResearcherDirect);
router.post('/share', profileController.shareProfileDirect);

// Extra REST aliases
router.get('/', profileController.getMyProfile);
router.get('/:id', profileController.getProfileByUserId);
router.delete('/', profileController.deleteProfile);

export default router;
