import { Request, Response, NextFunction } from 'express';
import { prisma } from '@lib/prisma';

async function getFSItems() {
  return await prisma.fileSystemItem.findMany();
}

async function getRootFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const root = await prisma.fileSystemItem.findFirst({
      where: {
        name: '/',
      },
    });
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
    const parent = await prisma.fileSystemItem.findFirst({
      where: {
        id: id,
        ownerId: ownerId,
      },
    });

    const children = await prisma.fileSystemItem.findMany({
      where: {
        parentId: id,
        ownerId: ownerId,
      },
    });

    res.render('files', { title: 'Files', children: children, folder: parent });
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
        ownerId: ownerId,
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
        ownerId: ownerId,
      },
    });

    console.log(`${newFolder.name} added!`);

    res.redirect(`/files/${id}/children`);
  } catch (error) {
    console.error(error);
    next(error);
  }
}

export default {
  getFSItems,
  getRootFolder,
  getChildren,
  getCreateFolderPage,
  createFolder,
};
