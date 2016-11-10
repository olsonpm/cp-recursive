'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird');

const bFs = bPromise.promisifyAll(require('fs'))
  , chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , cpRecursive = require('../index')
  , dirCompare = require('dir-compare')
  , path = require('path')
  , bRimraf = bPromise.promisify(require('rimraf'))
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  ;


//------//
// Init //
//------//

chai.use(sinonChai)
  .use(chaiAsPromised)
  .should()
  ;


//------//
// Main //
//------//

describe('pool size 1', () => {
  it('copy non-existing dest synchronously', () => {
    const src = path.join(__dirname, 'deep-dir')
      , dest = path.join(__dirname, 'deep-dir2')
      ;

    after(() => bRimraf(dest));

    return cpRecursive(src, dest)
      .then(() => dirCompare.compare(src, dest, { compareContent: true }))
      .then(res => { res.same.should.be.true; })
      ;
  });

  it('copy existing dest synchronously', () => {
    const src = path.join(__dirname, 'deep-dir')
      , existingDest = path.join(__dirname, 'existing')
      , compareDest = path.join(existingDest, 'deep-dir')
      ;

    after(() => bRimraf(existingDest));

    return bFs.mkdirAsync(existingDest)
      .then(() => cpRecursive(src, existingDest))
      .then(() => dirCompare.compare(src, compareDest, { compareContent: true }))
      .then(res => { res.same.should.be.true; })
      ;
  });

  it('curries currectly', () => {
    const src = path.join(__dirname, 'deep-dir')
      , dest = path.join(__dirname, 'deep-dir3')
      , cpRecursiveSpy = sinon.spy(cpRecursive)
      , opts = { concurrencyLimit: 1 }
      ;

    after(() => bRimraf(dest));

    const bRes = cpRecursiveSpy(src)(dest, opts);

    bRes._concurrencyLimit.should.equal(1);
    return bRes.then(() => dirCompare.compare(src, dest, { compareContent: true }))
      .then(res => {
        res.same.should.be.true;
      })
      ;
  });
});
