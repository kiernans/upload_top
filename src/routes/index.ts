import { Router } from 'express';
import signupController from 'controllers/signupController';
import authController from 'controllers/authController';
import fileController from 'controllers/fileController';

const router = Router();

/**
 * ------------------ MIDDLEWARE ------------------------
 * Require login for all /files routes
 */
router.use('/files', authController.checkLogin);
router.use('/files/:id', authController.checkFileOwnership);

/**
 * ------------------ GET ROUTES ------------------------
 */

// Home
router.get('/', (req, res) => {
  res.render('index', {});
});

// Authentication routes
router.get('/log-in', (req, res) => res.render('log-in', {}));
router.get('/sign-up', (req, res) => res.render('sign-up', {}));
router.get('/log-out', authController.logout);

// Root folder route (creates if missing, otherwise redirects to children)
router.get('/files', fileController.getRootFolder);

// Development-only route: list all files
if (process.env.NODE_ENV === 'development') {
  // Debug route: returns all files (dangerous for production)
  router.get('/files/all', fileController.getAllFiles);
}

// File system routes (keep specific before catch-all)
router.get('/files/:id/create', fileController.getCreateFolderPage);
router.get('/files/:id/upload', (req, res) => {
  const { id: currentFolderId } = req.params;
  res.render('upload', { currentFolderId });
});
// Gets all subfolders/files in a folder
router.get('/files/:id/children', fileController.getChildren);
router.get('/files/:id', fileController.getFileSystemMetadata);

/**
 * ------------------ POST ROUTES ------------------------
 */

// Auth Actions
router.post('/log-in', authController.login);
router.post('/sign-up', signupController.createUser);

// File Actions
router.post('/files/:id/upload', fileController.uploadFile);
router.post('/files/:id/create', fileController.createFolder);

export default router;
