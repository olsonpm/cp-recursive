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

const p = aPath => path.join(__dirname, aPath)
  , deepDir = p('deep-dir')
  , deepDir2 = p('deep-dir2')
  , existing = p('existing')
  , compareExisting = p('existing/deep-dir')
  , test = p('test.txt')
  , test2 = p('test2.txt')
  ;

afterEach(() => {
    return bPromise.all(
    [deepDir2, existing, test, test2].map(aPath => bRimraf(aPath))
  );});

it('copy non-existing dest synchronously', () => {
  return cpRecursive(deepDir, deepDir2)
    .then(() => dirCompare.compare(deepDir, deepDir2, { compareContent: true }))
    .then(res => { res.same.should.be.true; })
    ;
});

it('copy existing dest synchronously', () => {
  return bFs.mkdirAsync(existing)
    .then(() => cpRecursive(deepDir, existing))
    .then(() => dirCompare.compare(deepDir, compareExisting, { compareContent: true }))
    .then(res => { res.same.should.be.true; })
    ;
});

it('copies a single file', () => {
  return bFs.writeFileAsync(test, '')
    .then(() => cpRecursive(test, test2))
    .then(() => bFs.statAsync(test2))
    .then(destStats => { destStats.isFile().should.be.true; })
    ;
});

it('copies a single file into existing-dir', () => {
  return bPromise.all([
      bFs.writeFileAsync(test, '')
      , bFs.mkdirAsync(existing)
    ])
    .then(() => cpRecursive(test, existing))
    .then(() => bFs.statAsync(path.join(existing, path.basename(test))))
    .then(destStats => { destStats.isFile().should.be.true; })
    ;
});

it('curries currectly', () => {
  const cpRecursiveSpy = sinon.spy(cpRecursive)
    , opts = { concurrencyLimit: 1 }
    ;

  const bRes = cpRecursiveSpy(deepDir)(deepDir2, opts);

  bRes._concurrencyLimit.should.equal(1);
  return bRes.then(() => dirCompare.compare(deepDir, deepDir2, { compareContent: true }))
    .then(res => { res.same.should.be.true; })
    ;
});

it('asynchronously copies two separate files to the same destination dir', () => {
  return bPromise.all([
      bFs.writeFileAsync(test, '')
      , bFs.writeFileAsync(test2, '')
      , bFs.mkdirAsync(existing)
    ])
    .then(() => bPromise.all([
      cpRecursive(test, existing)
      , cpRecursive(test2, existing)
    ]))
    .then(() => bPromise.props({
      testStats: bFs.statAsync(path.join(existing, path.basename(test)))
      , test2Stats: bFs.statAsync(path.join(existing, path.basename(test2)))
    }))
    .then(({ testStats, test2Stats }) => {
      testStats.isFile().should.be.true;
      test2Stats.isFile().should.be.true;
    })
    ;
});
