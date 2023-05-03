require("dotenv").config();
const cluster = require("cluster");
// to use this, just boot with node cluster.js instead of node index.js
// TODO: inspect process mem footprint, make up way to self-detect
// memory leak. The difficult edge case for this is when the webserver is not
// getting a break between requests, a constant stream of requests means
// we cannot check the idle footprint.

if (cluster.isMaster) {
  const poolSize = process.env.CONCURRENT_JOBS || 10;

  for (let i = 0; i < poolSize; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `worker ${worker.process.pid} died with code ${code}, signal ${signal}`
    );
  });
  cluster.on("online", (worker) => {
    console.log(
      `worker ${worker.id}, ${
        Object.keys(cluster.workers).length
      } workers are now online`
    );
  });
  setInterval(() => {
    const numWorkers = Object.keys(cluster.workers).length; // this does work, they clean up when they die
    if (numWorkers < poolSize) {
      cluster.fork();
    }
  }, 250);
} else {
  require("./index");
}
