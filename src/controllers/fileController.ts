import { createHash } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import mime from 'mime-types';
import multer from 'multer';

import { PrismaClient } from '@prisma/client';

import { authenticateToken } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

const calculateChecksum = (filePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const hash = createHash('sha256');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/bmp',
            'image/webp',
            'image/tiff',
            'image/svg+xml',
            'image/x-icon',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/rtf',
            'text/plain',
            'text/csv',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

export const uploadFile = [
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;

        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { isApproved: true },
            });

            if (!user || !user.isApproved) {
                return res.status(403).send('Upload permission denied. Please contact admin.');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(500).send('Error checking user approval');
        }
    },
    upload.single('file'), // Adjust 'file' to match the key used in FormData
    async (req: Request, res: Response) => {
        if (!req.file) return res.status(400).send('No file uploaded.');

        const { filename, path: filePath, size } = req.file;
        const userId = (req as any).user.id;

        try {
            const checksum = await calculateChecksum(filePath);

            const existingFile = await prisma.file.findFirst({
                where: {
                    checksum,
                    userId,
                },
            });

            if (existingFile) {
                fs.unlinkSync(filePath);
                return res.status(200).json({
                    message: 'File already uploaded',
                    fileId: existingFile.id,
                });
            }

            const newFile = await prisma.file.create({
                data: {
                    filename,
                    filepath: filePath,
                    filesize: BigInt(size),
                    checksum,
                    user: { connect: { id: userId } },
                },
            });

            res.status(200).json({ message: 'File uploaded successfully', fileId: newFile.id });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error saving file metadata');
        }
    },
];

export const uploadMultipleFiles = [
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { isApproved: true },
            });
            if (!user || !user.isApproved) {
                return res.status(403).send('Upload permission denied. Please contact admin.');
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(500).send('Error checking user approval');
        }
    },
    (req: Request, res: Response, next: NextFunction) => {
        upload.array('files', 10)(req, res, (err: any) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).send(`Multer error: ${err.message}`);
            } else if (err) {
                return res.status(400).send(`Upload error: ${err.message}`);
            }
            next();
        });
    },
    async (req: Request, res: Response) => {
        if (!req.files) return res.status(400).send('No files uploaded.');
        const files = req.files as Express.Multer.File[];
        const userId = (req as any).user.id;

        try {
            const fileRecords = await Promise.all(
                files.map(async (file) => {
                    const { filename, path: filePath, size } = file;
                    const checksum = await calculateChecksum(filePath);

                    const existingFile = await prisma.file.findFirst({
                        where: {
                            checksum,
                            userId,
                        },
                    });

                    if (existingFile) {
                        fs.unlinkSync(filePath);
                        return existingFile;
                    }

                    const newFile = await prisma.file.create({
                        data: {
                            filename,
                            filepath: filePath,
                            filesize: BigInt(size),
                            checksum,
                            user: { connect: { id: userId } },
                        },
                    });

                    return newFile;
                })
            );

            res.status(200).json({ message: 'Files processed successfully', files: fileRecords });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error saving file metadata');
        }
    },
];

export const downloadFileById = [
    async (req: Request, res: Response) => {
        const fileId = parseInt(req.params.id, 10);
        try {
            const file = await prisma.file.findUnique({
                where: { id: fileId },
            });
            if (!file) return res.status(404).send('File not found.');
            res.setHeader('Content-Disposition', `attachment; filename=${file.filename}`);
            res.setHeader('Content-Type', mime.lookup(file.filename) || 'application/octet-stream');
            res.download(file.filepath, file.filename);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error retrieving file');
        }
    },
];
