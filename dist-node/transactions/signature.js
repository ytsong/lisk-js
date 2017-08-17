'use strict';

var _crypto = require('./crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _constants = require('../constants');

var _constants2 = _interopRequireDefault(_constants);

var _slots = require('../time/slots');

var _slots2 = _interopRequireDefault(_slots);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @method newSignature
 * @param secondSecret
 *
 * @return {Object}
 */

/*
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
 */
/**
 * Signature module provides functions for creating second signature registration transactions.
 * @class signature
 */
function newSignature(secondSecret) {
  var _crypto$getKeys = _crypto2.default.getKeys(secondSecret),
      publicKey = _crypto$getKeys.publicKey;

  return { publicKey: publicKey };
}

/**
 * @method createSignature
 * @param secret
 * @param secondSecret
 * @param timeOffset
 *
 * @return {Object}
 */

function createSignature(secret, secondSecret, timeOffset) {
  var keys = _crypto2.default.getKeys(secret);

  var signature = newSignature(secondSecret);
  var transaction = {
    type: 1,
    amount: 0,
    fee: _constants2.default.fees.signature,
    recipientId: null,
    senderPublicKey: keys.publicKey,
    timestamp: _slots2.default.getTimeWithOffset(timeOffset),
    asset: {
      signature: signature
    }
  };

  return (0, _utils.prepareTransaction)(transaction, keys, secondSecret);
}

module.exports = {
  createSignature: createSignature
};