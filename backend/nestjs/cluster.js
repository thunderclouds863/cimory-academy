import cluster from 'node:cluster';
import os from 'node:os';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Set UV_THREADPOOL_SIZE sebelum import
  process.env.UV_THREADPOOL_SIZE = '8';
  
  // Import main app
  await import('./dist/main.js');
  
  console.log(`Worker ${process.pid} started`);
}