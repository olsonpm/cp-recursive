# Promise Concurrency Pool

## Why create this module?

I needed the ability to add to a pool from multiple places in my application.
I didn't feel like hacking my application to fit the api provided
by es6-promise-pool

## Contrived Example

```js

// some helpers
const log = console.log
  , bPromise = require('bluebird');

const wait = ms => ({
  thenLog: msg => ({
    fn: () => bPromise.delay(ms).then(() => log(msg))
  })
});

// now create the pool
const myPool = require('promise-concurrency-pool')
  .create({ size: 2, onSettled: () => log('empty!') });

myPool.add(wait(15).thenLog('third').fn)
  .add(wait(5).thenLog('first').fn)
  .add(wait(2).thenLog('second').fn);

// prints
//
// first
// second
// third
// empty!
```

## API

`require('promise-concurrency-pool')` returns an object with a single
property `create`.

`create(argsObj) -> pool`

where `argsObj` is an object with the properties

```
size <int>
 *required
 - the size of the pool

onSettled <function>
 - a function to call every time the pool settles (no active promises in
   the pool)
```

and `pool` is an object with the properties
```
add(promiseFn) -> pool
 *chainable
 - 'promiseFn' is a 'promise-returning-function'
 - adds promiseFn to a queue.  When a promise in the pool finishes, it grabs one
   from this queue until empty.

size <int>
 *readonly
 - the size of the pool
```

## Test

`npm test`
