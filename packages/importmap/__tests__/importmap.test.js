'use strict';

const importmap = require('..');
const assert = require('assert').strict;

assert.strictEqual(importmap(), 'Hello from importmap');
console.info('importmap tests passed');
