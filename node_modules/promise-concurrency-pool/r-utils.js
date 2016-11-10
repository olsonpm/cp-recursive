'use strict';


//---------//
// Imports //
//---------//

const r = require('ramda');


//------//
// Init //
//------//

const spreadLast = createSpreadLast();


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

const invoke = r.curry(
  (prop, obj) => r.pipe(r.prop, r.bind(r.__, obj), r.call)(prop, obj)
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


//---------//
// Exports //
//---------//

module.exports = {
  defAnImmutableProp, defAProp, defImmutableProps, invoke, mutableAssoc
  , spreadLast 
};
