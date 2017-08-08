'use strict';

var _browserifyBignum = require('browserify-bignum');

var _browserifyBignum2 = _interopRequireDefault(_browserifyBignum);

var _cryptoBrowserify = require('crypto-browserify');

var _cryptoBrowserify2 = _interopRequireDefault(_cryptoBrowserify);

var _buffer = require('buffer');

var _words = require('./words');

var _words2 = _interopRequireDefault(_words);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @method entropyToSha256
 * @param {Buffer} entropy
 * @returns {Buffer}
 * @private
 */

/*
 * Original mnemonic implementation from https://github.com/bitpay/bitcore-mnemonic
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 BitPay
 *
 * https://github.com/bitpay/bitcore-mnemonic/blob/master/LICENSE
 *
 * --------------------------------------------------
 *
 * Copyright © 2017 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 *
 */
/**
 * Mnemonic module provide functions for generation bip39 mnemonic
 * @class mnemonic
 */
function entropyToSha256(entropy) {
  return _cryptoBrowserify2.default.createHash('sha256').update(entropy).digest();
}

/**
 * @method entropyChecksum
 * @param {Buffer} entropy
 * @returns {string}
 */

function entropyChecksum(entropy) {
  var hash = entropyToSha256(entropy);
  var bits = entropy.length * 8;
  var cs = bits / 32;
  var hashbits = _browserifyBignum2.default.fromBuffer(hash).toString(2);
  // zero pad the hash bits
  while (hashbits.length % 256 !== 0) {
    hashbits = '0' + hashbits;
  }
  var checksum = hashbits.slice(0, cs);
  return checksum;
}

/**
 *
 * @method generate
 * @returns {string} A string of 12 random words
 * @public
 */

function generate() {
  var entropy = _cryptoBrowserify2.default.randomBytes(16);
  var bin = Array.from(entropy).map(function (byte) {
    return ('00000000' + byte.toString(2)).slice(-8);
  }).join('');
  var checksum = entropyChecksum(entropy);
  var binWithChecksum = '' + bin + checksum;
  var mnemonic = new Array(Math.ceil(binWithChecksum.length / 11)).fill().map(function (_, i) {
    var slice = binWithChecksum.slice(i * 11, (i + 1) * 11);
    var wordIndex = parseInt(slice, 2);
    return _words2.default[wordIndex];
  });
  return mnemonic.join(' ');
}

/**
 * @method isValid
 * @param {any} mnemonic A string of 12 random words
 * @returns {boolean}
 * @public
 */

function isValid(mnemonic) {
  var words = mnemonic.split(' ');
  if (words.length !== 12 || words.some(function (w) {
    return !_words2.default.includes(w);
  })) {
    return false;
  }
  var bin = words.map(function (word) {
    return ('00000000000' + _words2.default.indexOf(word).toString(2)).slice(-11);
  }).join('');

  var checksumLength = bin.length / 33;
  var hashBits = bin.slice(-checksumLength);
  var nonhashBits = bin.slice(0, bin.length - checksumLength);
  var buf = _buffer.Buffer.from(new Array(nonhashBits.length / 8).fill().map(function (_, i) {
    var slice = bin.slice(i * 8, (i + 1) * 8);
    return parseInt(slice, 2);
  }));
  var expectedHashBits = entropyChecksum(buf);
  return expectedHashBits === hashBits;
}

module.exports = {
  generate: generate,
  isValid: isValid
};