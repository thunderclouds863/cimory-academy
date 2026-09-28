// Set UV_THREADPOOL_SIZE SEBELUM Node.js initialize
process.env.UV_THREADPOOL_SIZE = '8';

// Baru import NestJS
import('./dist/main.js');