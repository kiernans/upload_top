import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma/client';
import signupController from '../controllers/signupController';
import authController from '../controllers/authController';
import uploadController from '../controllers/uploadController';

const router = Router();

/**
 * ------------------ GET ROUTES ------------------------
 */
router.get('/', async (req, res) => {
  const prisma = new PrismaClient();
  console.log(await prisma.user.findMany());
  console.log(req.user);
  res.render('index', {});
});

router.get('/log-in', (req, res) => res.render('log-in', {}));

router.get('/sign-up', (req, res) => res.render('sign-up', {}));

router.get('/log-out', authController.logout);

router.get('/upload', (req, res) => res.render('upload'));
/**
 * ------------------ POST ROUTES ------------------------
 */
router.post('/log-in', authController.login);

router.post('/sign-up', signupController.createUser);

router.post('/upload', uploadController.uploadFile);

export default router;
