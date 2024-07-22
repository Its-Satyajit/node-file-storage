import express from 'express';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import adminDashboardRoutes from './routes/adminDashboardRoutes';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import fileRoutes from './routes/fileRoutes';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/files', fileRoutes);
app.use('/admin', adminDashboardRoutes);
app.use('/manage', adminRoutes);
app.use('/auth', authRoutes);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
