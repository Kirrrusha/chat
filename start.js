const cluster = require('cluster');
const express = require( 'express' );
const cpus = require('os').cpus();

const startWorker = () => {
  const worker = cluster.fork();
  console.log(`CLUSTER: ${worker.id}`);
};

if (cluster.isMaster) {
  cpus.forEach(() => {
    startWorker();
  });
  cluster.on('disconnect', (worker) => {
    console.log(`crushed worker: ${worker.id}`);
  });
  cluster.on('exit', (worker, code, signal) => {
    console.log('worker %d died with exit code %d (%s). restarting...',
      worker.process.pid, code,  signal);
    startWorker();
  })
} else {
  // require('./app')();
  const app    = express();
  const  routes = require( './routes/auth' )( app );

  app
    .use( express.bodyParser() )
    .listen( port );
}
