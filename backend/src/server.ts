import { app } from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 5001;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`[TaskFlow Backend] Server running on http://${HOST}:${PORT}`);
  console.log(`[TaskFlow Backend] Health check: http://${HOST}:${PORT}/api/health`);
});
