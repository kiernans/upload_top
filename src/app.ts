import path from 'node:path';
import express, { Express, Request, Response, NextFunction } from 'express';
import expressSession from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '../generated/prisma/client';
import { Strategy as LocalStrategy } from 'passport-local';
import authController from './controllers/authController';
import passport from 'passport';
import router from './routes';

// Standard setup with Express and EJS
const app: Express = express();
// Assumes files are in src folder and views is one level up
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: 'a santa at nasa',
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

// Added to avoid having to pass req.user into each controller/view
// Puts into currentUser local variable
// MUST BE AFTER PASSPORT AND BEFORE ROUTER for controller/views to be able to see
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Strategy to be used by authenticate later
// usernameField VERY IMPORTANT or else authenticate will always fail
// as it looks for the field that's called username by default
passport.use(
  new LocalStrategy({ usernameField: 'email' }, authController.verifyFunction),
);

app.use('/', router);

// Put user information into cookie for continued authentication
passport.serializeUser(authController.serializeUser);

// Deserializes info from cookie and uses to look up user in database
// This allows for continued authentication throughout app after login
passport.deserializeUser(authController.deserializeUser);

// Setting up listener
const PORT = process.env.EXPRESS_PORT;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Error checking for Express app
// Must be placed after all other middleware to catch error properly
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).send(err.message);
});
