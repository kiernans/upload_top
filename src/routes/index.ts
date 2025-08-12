import { Router } from 'express';
import signupController from 'controllers/signupController';
import authController from 'controllers/authController';
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

// This route creates root folder if it does not exist
// Otherwise it redirects to /files/:id/children
router.get('/files', fileController.getRootFolder);

if (process.env.NODE_ENV === 'development') {
  router.get('/files/all/', fileController.getAllFiles);
}

router.get('/files/:id/', fileController.getFileSystemMetadata);

// Form for creating subfolder
router.get('/files/:id/create', fileController.getCreateFolderPage);

router.get('/files/:id/upload', (req, res) => {
  const { id: currentFolderId } = req.params;
  res.render('upload', { currentFolderId: currentFolderId });
});

// Gets all subfolders/files in a folder
router.get('/files/:id/children', fileController.getChildren);

/**
 * ------------------ POST ROUTES ------------------------
 */
router.post('/log-in', authController.login);

router.post('/sign-up', signupController.createUser);

router.post('/files/:id/upload', fileController.uploadFile);

router.post('/files/:id/create', fileController.createFolder);

export default router;
