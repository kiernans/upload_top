import { NextFunction, Request, Response } from 'express';
import { body, validationResult, Meta, matchedData } from 'express-validator';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../../generated/prisma/client';
// import db from '../db/query';

// The Custom validator uses value and Meta objects as inputs
function passwordMatches(value: string, { req }: Meta) {
  return value === req.body.password;
}

// Fixes issue of typescript not knowing if error has code property
function isPgError(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

const validateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 30 })
    .withMessage('Name length must be between 1 and 30 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .normalizeEmail()
    .isEmail()
    .withMessage('Must be in email format')
    .isLength({ min: 1, max: 30 })
    .withMessage('Email length must be between 1 and 30 characters'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isStrongPassword(),
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Must confirm password')
    .isStrongPassword()
    .custom(passwordMatches)
    .withMessage('Passwords do not match'),
];

// Needed to spread validate user bc the router expects an array of middleware functions
// but without spreading, you're providing an array containing an array and a middleware function
// (each item in the validateUser array is a middleware function?)

const createUser = [
  ...validateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.send({ errors: errors.array() });
    }

    try {
      const { name, email, password } = matchedData(req);
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { name, email, password: hashedPassword };

      const prisma = new PrismaClient();
      await prisma.user.create({
        data: newUser,
      });
    } catch (error) {
      if (isPgError(error) && error.code === '23505') {
        // Unique violation error code in PostgreSQL
        return res.status(400).json({ error: 'User already exists' });
      }
      console.error(error);
      next(error);
    }
    res.redirect('/');
  },
];

export default {
  createUser,
};
