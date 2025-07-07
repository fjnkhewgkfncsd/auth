import express from 'express';
import dotenv from 'dotenv';
import studentRoutes from './routes/student.routes.js';
import courseRoutes from './routes/course.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import authRoutes from './routes/auth.routes.js';
import { serveSwagger, setupSwagger } from './config/swagger.js';
import { authMiddleware } from './middleware/auth.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/docs', serveSwagger, setupSwagger);

app.use('/students',authMiddleware, studentRoutes);
app.use('/courses',authMiddleware, courseRoutes);
app.use('/teachers',authMiddleware, teacherRoutes);
app.use('/auth',authRoutes);

app.get('/', (req, res) => res.send('Welcome to School API!'));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
