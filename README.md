# cp-recursive
Yet another `cp -r` function

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents
- [Why I built this module](#why-i-built-this-module)
- [Examples](#examples)
  - [Example 1](#example-1)
  - [Example 2](#example-2)
  - [Example 3](#example-3)
- [API](#api)
- [Test](#test)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Why I built this module
I was sick of the various `cp -r` modules not behaving as `cp -r` in linux does.  Specifically, the modules I tried would not copy src into dest if
dest was an existing directory.  There are probably other caveats I may adress in the future.

### Why you probably shouldn't use this lib
There are plenty of `cp -r` node modules out there which are battle-tested.
Mine is intended for personal use.

## Examples
All examples assume
```js
const cpRecursive = require('cp-recursive')
  , logf = msg => () => { console.log('msg'); };
```


### Example 1
 - Basic use  

Assume the following directory
```
index.js
parent
  /child.txt
```

```js
// index.js
cpRecursive('parent', 'parent2')
  .then(logf('done'));
```

results in
```
index.js
parent
  /child.txt
parent2
  /child.txt
```

### Example 2
 - Copies src into dest if dest is a directory  

Assume the following directory
```
index.js
parent
  /child.txt
grandparent
```

```js
// index.js
cpRecursive('parent', 'grandparent')
  .then(logf('done'));
```

results in
```
index.js
parent
  /child.txt
grandparent
  /parent
    /child.txt
```

### Example 3
 - Limit concurrency  

```js
cpRecursive('some-large-dir', 'copied', { concurrencyLimit: 20 })
  .then(logf('done'));
```


## API
`require('cp-recursive')` returns a curriedN(2) function
 * If you don't know what currying is, you're safe.  Just use this function
   like any other

```
cpRecursive(src, dest, opts) -> promise

src
 - source path to recursively copy

dest
 - dest path
 * if dest is a directory, then cpRecursive copies src into dest

opts
 - an object with the following schema
 {
   concurrencyLimit: <int> || 5
 }

promise
 - resolves when done
 * do not expect errors to be handled nicely.  I have not addressed error
   handling due to haste
```

## Test
`npm test`
