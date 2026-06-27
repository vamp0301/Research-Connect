import Profile from '../models/Profile.js';
import AcademicProfile from '../models/AcademicProfile.js';
import Publication from '../models/Publication.js';
import * as scholarService from '../services/scholar.service.js';
import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

/**
 * Get current user profile and metrics
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id })
      .populate('user', 'fullName email role status emailVerified')
      .populate('academicProfile')
      .populate({
        path: 'researchAreas',
        populate: { path: 'researchArea', select: 'areaName slug' }
      })
      .populate({
        path: 'keywords',
        populate: { path: 'keyword', select: 'keyword slug' }
      });

    if (!profile) {
      return next(new AppError('Profile not found for this user.', 404));
    }

    // Query and populate publications created/linked to this user, including their co-authors
    const publications = await Publication.find({ user: req.user._id })
      .populate({
        path: 'authors',
        options: { sort: { authorOrder: 1 } } // Sort co-authors by order of appearance
      });

    res.status(200).json({
      status: 'success',
      profile,
      publications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile fields
 */
export const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const {
      bio,
      designation,
      department,
      institution,
      country,
      state,
      city,
      highestQualification,
      experience,
      phone,
      website,
      gender,
      languages
    } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      {
        bio,
        designation,
        department,
        institution,
        country,
        state,
        city,
        highestQualification,
        experience,
        phone,
        website,
        gender,
        languages
      },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return next(new AppError('Profile not found.', 404));
    }

    res.status(200).json({
      status: 'success',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Preview Google Scholar details before importing
 * GET /api/v1/profile/google-scholar/preview
 */
export const previewGoogleScholar = async (req, res, next) => {
  try {
    const { input } = req.query;

    if (!input) {
      return next(new AppError('Please provide a Scholar URL, Author ID, or Name.', 400));
    }

    const result = await scholarService.getScholarImportPreview(input);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Google Scholar Profile Import (and selective sync)
 * POST /api/v1/profile/google-scholar/import
 */
export const importGoogleScholar = async (req, res, next) => {
  try {
    const { authorId, selectedPubTitles } = req.body;

    if (!authorId) {
      return next(new AppError('Please provide a Google Scholar author ID.', 400));
    }

    const result = await scholarService.importGoogleScholarProfile(req.user._id, authorId, selectedPubTitles);

    res.status(200).json({
      status: 'success',
      message: 'Google Scholar profile and publications imported successfully.',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync Google Scholar data manually
 * PUT /api/v1/profile/google-scholar/sync
 */
export const syncGoogleScholar = async (req, res, next) => {
  try {
    const academicProfile = await AcademicProfile.findOne({ user: req.user._id });
    if (!academicProfile || !academicProfile.googleScholar) {
      return next(new AppError('No connected Google Scholar profile found.', 400));
    }

    const result = await scholarService.importGoogleScholarProfile(req.user._id, academicProfile.googleScholar);

    res.status(200).json({
      status: 'success',
      message: 'Google Scholar profile synchronized successfully.',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unlink Google Scholar profile from account
 * DELETE /api/v1/profile/google-scholar/unlink
 */
export const unlinkGoogleScholar = async (req, res, next) => {
  try {
    await scholarService.unlinkGoogleScholarProfile(req.user._id);

    res.status(200).json({
      status: 'success',
      message: 'Google Scholar account unlinked successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Recount/Refresh publication statistics
 * POST /api/v1/profile/google-scholar/refresh
 */
export const refreshGoogleScholar = async (req, res, next) => {
  try {
    await Profile.recalculateMetrics(req.user._id);

    res.status(200).json({
      status: 'success',
      message: 'Researcher metrics recounted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Profile Photo / Cover Photo
 */
export const uploadPhoto = async (req, res, next) => {
  try {
    const isCover = req.path.includes('cover');
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : '';

    if (!photoUrl) {
      return next(new AppError('No photo file uploaded.', 400));
    }

    const updateField = isCover ? { coverPhoto: photoUrl } : { profilePhoto: photoUrl };

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      updateField,
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      message: `${isCover ? 'Cover' : 'Profile'} photo updated successfully.`,
      profile,
    });
  } catch (error) {
    next(error);
  }
};
