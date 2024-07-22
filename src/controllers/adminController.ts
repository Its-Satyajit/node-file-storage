import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const approveUser = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { isApproved: true },
        });
        res.status(200).send('User approved for upload');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error approving user');
    }
};

export const denyUser = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { isApproved: false },
        });
        res.status(200).send('User denied upload permission');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error denying user');
    }
};
