import { body } from 'express-validator';

export const validateSignup = [
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('email')
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter'),

  body('role')
    .optional()
    .isIn(['researcher', 'admin', 'reviewer', 'sponsor'])
    .withMessage('Invalid user role'),
];

export const validateProfileUpdate = [
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Designation cannot exceed 100 characters'),

  body('institution')
    .notEmpty()
    .withMessage('Institution name is required')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Institution name must be between 2 and 200 characters'),

  body('country')
    .notEmpty()
    .withMessage('Country is required')
    .trim(),

  body('experience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Experience must be a positive integer representing years'),

  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),

  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Invalid gender value'),

  body('languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array of strings'),
];

export const validateCollaborationPreferences = [
  body('openForCollaboration')
    .optional()
    .isBoolean()
    .withMessage('openForCollaboration must be a boolean'),

  body('collaborationStatus')
    .optional()
    .isIn(['Open', 'Looking for Co-author', 'Joint Research', 'Industry Collaboration', 'Funded Project'])
    .withMessage('Invalid collaboration status value'),

  body('preferredCountries')
    .optional()
    .isArray()
    .withMessage('Preferred countries must be an array of strings'),

  body('fundingRequired')
    .optional()
    .isBoolean()
    .withMessage('fundingRequired must be a boolean'),
];
