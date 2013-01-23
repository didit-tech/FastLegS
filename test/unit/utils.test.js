/**
 * Module dependencies.
 */

var expect = require('expect.js');
var utils = require('../../lib/adapters/mysql/utils');

/**
 * utils  test.
 */

describe('Utils test for', function() { 
  it('adds backticks if field has a space', function() { 
    expect(utils.backtick('field')).to.be('field');
    expect(utils.backtick('field again')).to.be("`field again`");
  });
})

