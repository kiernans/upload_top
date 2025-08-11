import { Request, Response, NextFunction } from 'express';
import { prisma } from '@lib/prisma';

async function getFSItems() {
  return await prisma.fileSystemItem.findMany();
}

async function getFSItemsById(id: string) {
  return await prisma.fileSystemItem.findUnique({
    where: {
      id: id,
    },
  });
}
