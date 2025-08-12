import { Router } from 'express';
import signupController from 'controllers/signupController';
import authController from 'controllers/authController';
import uploadController from 'controllers/uploadController';
import fileController from 'controllers/fileController';

const router = Router();

/**
 * ------------------ GET ROUTES ------------------------
 */
router.get('/', async (req, res) => {
  res.render('index', {});
});

router.get('/log-in', (req, res) => res.render('log-in', {}));

router.get('/sign-up', (req, res) => res.render('sign-up', {}));

router.get('/log-out', authController.logout);

router.get('/files/:id/upload', (req, res) => res.render('upload'));

router.get('/files', fileController.getRootFolder);

router.get('/files/:id/', fileController.getFSItems);

router.get('/files/:id/create', fileController.getCreateFolderPage);

router.get('/files/:id/children', fileController.getChildren);

/**
 * ------------------ POST ROUTES ------------------------
 */
router.post('/log-in', authController.login);

router.post('/sign-up', signupController.createUser);

router.post('/files/:id/upload', uploadController.uploadFile);

router.post('/files/:id/create', fileController.createFolder);

export default router;
