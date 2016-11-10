'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird');

const bFs = bPromise.promisifyAll(require('fs'))
  , path = require('path')
  , pcp = require('promise-concurrency-pool')
  , r = require('ramda')
  , rUtils = require('./r-utils')
  ;


//------//
// Init //
//------//

const bCopyFile = bPromise.promisify(copyFile)
  , { invoke } = rUtils
  ;

let concurrencyPool;


//------//
// Main //
//------//

const exportMe = r.curryN(
  2
  , (srcPath, destPath, opts) => {
    const res = new Promise(onSettled => {
      opts = r.merge({ concurrencyLimit: 5 }, opts);
      concurrencyPool = pcp.create({ size: opts.concurrencyLimit, onSettled });

      bFs.statAsync(destPath)
        .catch({ code: 'ENOENT' }, r.always(undefined))
        .then(destStats => {
          const destIsDir = invoke('isDirectory', destStats);

          if (destIsDir) {
            destPath = path.join(destPath, path.basename(srcPath));
          }

          return (destIsDir)
            ? bFs.mkdirAsync(destPath)
            : undefined;
        })
        .then(() => bRecursivelyCopy(srcPath, destPath))
        ;
    });

    res._concurrencyLimit = opts.concurrencyLimit;
    return res;
  }
);


//-------------//
// Helper Fxns //
//-------------//

function bRecursivelyCopy(srcPath, destPath) {
  const getDestPath = src => path.join(destPath, path.basename(src));

  concurrencyPool.add(
    () => bFs.statAsync(srcPath).then(copyFileOrDir)
  );

  // scoped helper fxns
  function copyFileOrDir(srcStats) {
    const res = (srcStats.isDirectory())
      ? () => bFs.mkdirAsync(destPath)
        .catch({ code: 'EEXIST' }, r.always(undefined))
        .then(() => bFs.readdirAsync(srcPath))
        .map(
          aSrcDirFile => bRecursivelyCopy(path.join(srcPath, aSrcDirFile), getDestPath(aSrcDirFile))
        )
      : () => bCopyFile(srcPath, destPath)
      ;

    concurrencyPool.add(res);
  }
}

// from here:
// http://stackoverflow.com/a/14387791

function copyFile(source, dest, cb) {
  let cbCalled = false;

  const rd = bFs.createReadStream(source)
    .on('error', done)
    ;

  const wr = bFs.createWriteStream(dest)
    .on('error', done)
    .on('close', r.nAry(0, done))
    ;

  rd.pipe(wr);

  function done(err) {
    if (cbCalled) return;

    cb(err);
    cbCalled = true;
  }
}


//---------//
// Exports //
//---------//

module.exports = exportMe;
