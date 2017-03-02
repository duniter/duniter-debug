"use strict";

const co = require('co');
const should = require('should');

describe('Empty test', () => {

  it('should be OK', () => co(function*(){
    "1".should.equal("1")
  }));
});
