import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import { VerifyFunction } from 'passport-local';
import passport, { DoneCallback } from 'passport';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '@lib/prisma';

interface User extends Express.User {
  id: string;
  is_admin: boolean;
}

// Function used by the passport-local strategy in app.ts
// This is used every time passport.authenticate is called
// Which will be used in the log-in POST route (the login function below)
const verifyFunction: VerifyFunction = async (username, password, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: username,
      },
    });

    if (!user) {
      return done(null, false, { message: 'Incorrect username' });
    }
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return done(null, false, { message: 'Incorrect password' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

const serializeUser = (user: Express.User, done: DoneCallback) => {
  // Tells passport to store the user ID into the connect.sid cookie
  // 'as User' required for Typescript to understand that our User has an ID
  // as Express.User does not have property, but passport.serializeUser expects Express.User
  done(null, (user as User).id);
};

const deserializeUser = async (id: string, done: DoneCallback) => {
  try {
    // Looks up user using the ID that's stored in the connect.sid cookie
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    done(null, user);
  } catch (err) {
    done(err);
  }
};

const validateUser = [
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
];

// Needed to spread validate user bc the router expects an array of middleware functions
// but without spreading, you're providing an array containing an array and a middleware function
// (each item in the validateUser array is a middleware function?)

const login = [
  ...validateUser,
  passport.authenticate('local', {
    failureRedirect: '/log-in',
    successRedirect: '/',
  }),
];

function logout(req: Request, res: Response, next: NextFunction) {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    res.redirect('/');
  });
}

function checkAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  } else {
    const isAdmin = (user as User).is_admin;
    if (!isAdmin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  }
}

function checkLogin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Must be logged in' });
  }
  next();
}

export default {
  login,
  verifyFunction,
  serializeUser,
  deserializeUser,
  logout,
  checkAdmin,
  checkLogin,
};
