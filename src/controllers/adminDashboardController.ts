import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                isApproved: true,
            },
        });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving users');
    }
};

export const getUserFilesStats = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const files = await prisma.file.findMany({
            where: { userId: parseInt(userId) },
            select: {
                filename: true,
                filesize: true,
            },
        });

        const totalSize = files.reduce((acc, file) => acc + Number(file.filesize), 0);

        res.status(200).json({
            files,
            totalSize: totalSize / (1024 * 1024),
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving user file stats');
    }
};

export const updateUserAccess = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { isApproved } = req.body;

    try {
        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { isApproved },
        });
        res.status(200).send('User access updated');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating user access');
    }
};
