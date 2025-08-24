'use strict';

const path = require('path');
const nodemon = require('nodemon');

let watcher = null;
let restarting = false;
let started = false;

function startNodemon() {
  const serverPath = path.resolve(__dirname, 'dev-server.cjs');
  nodemon({
  // Ensure the debugger is enabled also for .cjs entry
  exec: 'node --inspect',
  args: process.argv.length > 2 ? process.argv.slice(2) : [path.resolve(__dirname, '../dist/main.cjs')],
    script: serverPath,
    ignore: ['*'],
    watch: ['foo/'],
    ext: 'noop',
  });
}

async function startViteWatch() {
  const vite = await import('vite');
  const config = await vite.resolveConfig({}, 'build');
  // Ensure development mode for watch
  const result = await vite.build({
    configFile: path.resolve(__dirname, '../vite.config.mts'),
    mode: 'development',
    build: { watch: {} },
  });

  watcher = /** @type {import('rollup').RollupWatcher} */ (result);
}

startViteWatch().then(() => {
  if (watcher && watcher.on) {
    watcher.on('event', (event) => {
      if (event.code === 'END') {
        if (!started) {
          started = true;
          startNodemon();
          return;
        }
        if (!restarting) {
          restarting = true;
          nodemon.restart();
          setTimeout(() => { restarting = false; }, 200);
        }
      } else if (event.code === 'ERROR' && event.error) {
        console.error(event.error);
      }
    });
  }
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
