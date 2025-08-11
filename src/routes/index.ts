import { Router } from 'express';
import { prisma } from '@lib/prisma';
import signupController from 'controllers/signupController';
import authController from 'controllers/authController';
import uploadController from 'controllers/uploadController';
import fileController from 'controllers/fileController';
import { nextTick } from 'node:process';

const router = Router();

/**
 * ------------------ GET ROUTES ------------------------
 */
router.get('/', async (req, res) => {
  // console.log('All users:');
  // console.log(await prisma.user.findMany());
  // console.log('User:');
  // console.log(req.user);
  console.log('FSItems:');
  console.log(await fileController.getFSItems());
  res.render('index', {});
});

router.get('/log-in', (req, res) => res.render('log-in', {}));

router.get('/sign-up', (req, res) => res.render('sign-up', {}));

router.get('/log-out', authController.logout);

router.get('/upload', (req, res) => res.render('upload'));

router.get('/files', fileController.getRootFolder);

router.get('/files/:id/', fileController.getFSItems);

router.get('/files/:id/create', fileController.getCreateFolderPage);

router.get('/files/:id/children', fileController.getChildren);

/**
 * ------------------ POST ROUTES ------------------------
 */
router.post('/log-in', authController.login);

router.post('/sign-up', signupController.createUser);

router.post('/upload', uploadController.uploadFile);

router.post('/files/:id/create', fileController.createFolder);

export default router;
