'use strict';


//---------//
// Imports //
//---------//

const r = require('ramda');


//------//
// Init //
//------//

const hasKey = createHasKey()
  , spreadLast = createSpreadLast()
  ;


//------//
// Main //
//------//

const defAnImmutableProp = r.curry(
  (obj, path, value) => Object.defineProperty(obj, path, { value, enumerable: true })
);

const defAProp = r.curry(
  (obj, path, desc) => Object.defineProperty(obj, path, desc)
);

const defImmutableProps = r.curry(
  (obj, pathValArr) => r.reduce(
    r.unapply(spreadLast(defAnImmutableProp))
    , obj
    , pathValArr
  )
);

const get = r.curry(
  (key, obj) => hasKey(key, obj)
    ? obj[key]
    : undefined
);

const invoke = r.curry(
  (key, obj) => r.is(Function, get(key, obj))
    ? obj[key]()
    : undefined
);

const mutableAssoc = r.curry(
  (path, val, obj) => { obj[path] = val; return obj; }
);


//-------------//
// Helper Fxns //
//-------------//

function createSpreadLast() {
  return r.curry(
    (fn, argArr) => fn(...r.init(argArr), ...r.last(argArr))
  );
}

function createHasKey() {
  return r.curry(
    (key, obj) => r.is(Object, obj)
      ? !!obj[key]
      : undefined
  );
}


//---------//
// Exports //
//---------//

module.exports = {
  defAnImmutableProp, defAProp, defImmutableProps, get, hasKey, invoke
  , mutableAssoc, spreadLast
};
