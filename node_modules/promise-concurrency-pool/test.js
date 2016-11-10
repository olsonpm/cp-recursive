'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird');

const chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , pcp = require('./index')
  , r = require('ramda')
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

const wait = ms => ({
  thenCall: fn => ({
    with: arg => () => bPromise.delay(ms).then(() => fn(arg))
  })
});


//------//
// Main //
//------//

describe('pool size 1', () => {
  it('should synchronously execute', testDone => {
    const spy = sinon.spy();

    const onSettled = r.pipe(assertSpy, testDone)
      , pool = pcp.create({ size: 1, onSettled })
      ;

    pool.add(wait(10).thenCall(spy).with('first'))
      .add(wait(5).thenCall(spy).with('second'))
      .add(wait(1).thenCall(spy).with('third'))
      ;

    function assertSpy() {
      if (!(
        spy.args[0][0] === 'first'
        && spy.args[1][0] === 'second'
        && spy.args[2][0] === 'third'
      )) {
        throw new Error("Assertion Failed: spy was not called as expected");
      }
    }
  });
});

describe('pool size 2', () => {
  it('should asynchronously execute in the correct order', testDone => {
    const spy = sinon.spy();

    const onSettled = r.pipe(assertSpy, testDone)
      , pool = pcp.create({ size: 2, onSettled })
      ;

    pool.add(wait(20).thenCall(spy).with('third'))
      .add(wait(10).thenCall(spy).with('first'))
      .add(wait(5).thenCall(spy).with('second'))
      .add(wait(10).thenCall(spy).with('fourth'))
      ;

    function assertSpy() {
      if (!(
        spy.args[0][0] === 'first'
        && spy.args[1][0] === 'second'
        && spy.args[2][0] === 'third'
        && spy.args[3][0] === 'fourth'
      )) {
        throw new Error("Assertion Failed: spy was not called as expected");
      }
    }
  });
});
