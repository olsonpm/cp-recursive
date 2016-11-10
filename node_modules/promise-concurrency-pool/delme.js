// some helpers
const log = console.log
  , bPromise = require('bluebird');

const wait = ms => ({
  thenLog: msg => ({
    fn: () => bPromise.delay(ms).then(() => log(msg))
  })
});

// now create the pool
const myPool = require('./index')
  .create({ size: 2 });

myPool.add(wait(15).thenLog('third').fn)
  .add(wait(5).thenLog('first').fn)
  .add(wait(2).thenLog('second').fn);
