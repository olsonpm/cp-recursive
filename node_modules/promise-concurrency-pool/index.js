'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird');

const r = require('ramda')
  , rUtils = require('./r-utils')
  ;


//------//
// Init //
//------//

const { defImmutableProps, invoke, mutableAssoc } = rUtils;


//------//
// Main //
//------//

const create = ({ size, onSettled = r.always(undefined) }) => {
  const promisePool = getPromisePool(size)
    , promiseFnFifo = []
    ;

  const api = { onSettled };

  return defImmutableProps(
    api
    , [
      ['add', createAdd({ promisePool, api, promiseFnFifo })]
      , ['size', size]
    ]
  );
};


//-------------//
// Helper Fxns //
//-------------//

function getPromisePool(size) {
  return r.pipe(
    r.range(0)
    , r.map(() => bPromise.resolve())
  )(size);
}

function createAdd({ promisePool, api, promiseFnFifo }) {
  const placeInPool = createPlaceInPool({ promisePool, api, promiseFnFifo });
  return aPromiseFn => {
    const availableIndex = r.findIndex(r.complement(invoke('isPending')), promisePool);

    if (availableIndex === -1) promiseFnFifo.push(aPromiseFn);
    else placeInPool(availableIndex, aPromiseFn);

    return api;
  };
}

function createPlaceInPool({ promisePool, api, promiseFnFifo }) {
  const setPoolAt = mutableAssoc(r.__, r.__, promisePool)
    , callFifoNothingOrEmpty = createCallFifoNothingOrEmpty({ promisePool, api, promiseFnFifo })
    ;

  return (availableIndex, aPromiseFn) => {
    setPoolAt(
      availableIndex
      , aPromiseFn().then(callFifoNothingOrEmpty)
    );
  };
}

function createCallFifoNothingOrEmpty({ promisePool, api, promiseFnFifo }) {
  return callFifoNothingOrEmpty;

  function callFifoNothingOrEmpty() {
    let res;

    if (promiseFnFifo.length) res = promiseFnFifo.shift()().then(callFifoNothingOrEmpty);
    else if (r.filter(invoke('isPending'), promisePool).length === 1) res = api.onSettled();

    return res;
  }
}


//---------//
// Exports //
//---------//

module.exports = { create };
