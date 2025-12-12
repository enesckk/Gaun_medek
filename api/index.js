// Vercel Serverless Function wrapper for Express backend
// ES Module import
// Backend klasörü installCommand ile api/backend/ içine kopyalanıyor
import expressApp from './backend/server.js';

// Vercel serverless function handler
// Express app'i direkt export et, Vercel otomatik handle edecek
export default expressApp;

