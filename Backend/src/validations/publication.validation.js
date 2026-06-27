import { body } from 'express-validator';

export const validatePublication = [
  body('title')
    .notEmpty()
    .withMessage('Publication title is required')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters long'),

  body('abstract')
    .notEmpty()
    .withMessage('Publication abstract is required')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Abstract must be at least 20 characters long'),

  body('doi')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i)
    .withMessage('Please provide a valid DOI (e.g. 10.1016/j.jbi.2026.104230)'),

  body('publicationYear')
    .notEmpty()
    .withMessage('Publication year is required')
    .isInt({ min: 1800, max: new Date().getFullYear() + 1 })
    .withMessage('Please provide a valid publication year'),

  body('publicationType')
    .optional()
    .isIn(['journal', 'conference', 'book', 'book-chapter', 'patent', 'thesis', 'preprint', 'other'])
    .withMessage('Invalid publication type'),

  body('citationCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Citation count cannot be negative'),

  body('pdfUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Please provide a valid URL to the PDF file'),

  body('visibility')
    .optional()
    .isIn(['public', 'private', 'restricted'])
    .withMessage('Invalid visibility level'),

  body('authors')
    .isArray({ min: 1 })
    .withMessage('At least one author must be specified'),

  body('authors.*.authorName')
    .notEmpty()
    .withMessage('Author name is required')
    .trim(),

  body('authors.*.authorOrder')
    .notEmpty()
    .withMessage('Author order is required')
    .isInt({ min: 1 })
    .withMessage('Author order must be an integer starting at 1'),

  body('authors.*.correspondingAuthor')
    .optional()
    .isBoolean()
    .withMessage('correspondingAuthor must be a boolean'),

  body('authors.*.email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email for the author'),
];
