import { Request, Response, NextFunction } from 'express';
import { prisma } from '@lib/prisma';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import type { FileSystemItem } from '../../generated/prisma';

/**
 * ------------------ FILE FUNCTIONS ------------------------
 */
const storagePath = path.join(__dirname, '../../public/data/uploads/');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Make sure destination exists before writing to it
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
    cb(null, storagePath);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
});

const addFileToDb = async (req: Request, res: Response, next: NextFunction) => {
  const { id: currentFolderId } = req.params;
  const ownerId = res.locals.currentUser.id;
  try {
    if (req.file) {
      const newFile = await prisma.fileSystemItem.create({
        data: {
          name: req.file.filename,
          type: 'FILE',
          parentId: currentFolderId,
          ownerId,
          mimeType: req.file.mimetype,
          size: req.file.size,
          url: storagePath,
        },
      });
      console.log(`${newFile.name} was added!`);
      console.log(newFile);
    }
  } catch (error) {
    console.log('Did not add to DB');
    console.error(error);
    next(error);
  }

  res.redirect(`/files/${currentFolderId}/children`);
};

const uploadFile = [upload.single('uploaded_file'), addFileToDb];

async function getAllFiles(req: Request, res: Response) {
  const userId = res.locals.currentUser.id;
  const files = await prisma.fileSystemItem.findMany({
    where: {
      type: 'FILE',
      ownerId: userId,
    },
  });

  console.log(files);
  res.redirect('/files');
}

async function deleteFile(file: FileSystemItem) {
  const filePath = path.join(storagePath, file.name);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      throw new Error(`Failed to delete ${file.name}`);
    }
  });
}

/**
 * ------------------ FOLDER FUNCTIONS ------------------------
 */

async function getFileSystemMetadata(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = res.locals.currentUser.id;
    const { id: fileId } = req.params;
    const file = await prisma.fileSystemItem.findFirst({
      where: { id: fileId, ownerId: userId },
    });
    console.log(file);
    res.redirect('/files');
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function getRootFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = res.locals.currentUser.id;
    let root = await prisma.fileSystemItem.findFirst({
      where: {
        name: '/',
        ownerId,
      },
    });

    // Create root folder if does not exist
    if (!root) {
      root = await prisma.fileSystemItem.create({
        data: {
          name: '/',
          type: 'FOLDER',
          ownerId,
        },
      });

      console.log('Creating root folder');
    }

    res.redirect(`/files/${root.id}/children`);
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function getChildren(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  const ownerId = res.locals.currentUser.id;

  try {
    const currentFolder = await prisma.fileSystemItem.findFirst({
      where: {
        id,
        ownerId,
      },
    });

    const children = await prisma.fileSystemItem.findMany({
      where: {
        parentId: id,
        ownerId,
      },
    });

    res.render('files', {
      title: 'Files',
      children,
      currentFolder,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function getCreateFolderPage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;
  const ownerId = res.locals.currentUser.id;

  try {
    const folder = await prisma.fileSystemItem.findFirst({
      where: {
        id: id,
        ownerId,
      },
    });

    res.render('create', { folder: folder });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function createFolder(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  const { folderName } = req.body;
  const ownerId = res.locals.currentUser.id;

  try {
    const newFolder = await prisma.fileSystemItem.create({
      data: {
        name: folderName,
        type: 'FOLDER',
        parentId: id,
        ownerId,
      },
    });

    console.log(`${newFolder.name} added!`);

    res.redirect(`/files/${id}/children`);
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function deleteItem(req: Request, res: Response, next: NextFunction) {
  const userId = res.locals.currentUser.id;
  const { id: itemId } = req.params;

  try {
    const deleted = await prisma.fileSystemItem.delete({
      where: {
        id: itemId,
        ownerId: userId,
      },
    });

    if (deleted.type === 'FILE') {
      deleteFile(deleted);
    }

    console.log(`${deleted.name} deleted.`);
    res.redirect('/files');
  } catch (error) {
    console.error(error);
    next(error);
  }
}

export default {
  uploadFile,
  getAllFiles,
  getFileSystemMetadata,
  getRootFolder,
  getChildren,
  getCreateFolderPage,
  createFolder,
  deleteItem,
};
