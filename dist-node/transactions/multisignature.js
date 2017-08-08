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
 * @method createTransaction
 * @param recipientId string
 * @param amount number
 * @param secret secret
 * @param secondSecret secret
 * @param requesterPublicKey string
 * @param timeOffset number
 *
 * @return {string}
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
 * Multisignature module provides functions for creating multisignature group registration
 * transactions, and signing transactions requiring multisignatures.
 * @class multisignature
 */
function createTransaction(recipientId, amount, secret, secondSecret, requesterPublicKey, timeOffset) {
  var keys = _crypto2.default.getKeys(secret);

  var transaction = {
    type: 0,
    amount: amount,
    fee: _constants2.default.fees.send,
    recipientId: recipientId,
    senderPublicKey: keys.publicKey,
    requesterPublicKey: requesterPublicKey || keys.publicKey,
    timestamp: _slots2.default.getTimeWithOffset(timeOffset),
    asset: {},
    signatures: []
  };

  return (0, _utils.prepareTransaction)(transaction, keys, secondSecret);
}

/**
 * @method signTransaction
 * @param trs transaction object
 * @param secret
 *
 * @return {string}
 */

function signTransaction(trs, secret) {
  var keys = _crypto2.default.getKeys(secret);
  var signature = _crypto2.default.multiSign(trs, keys);

  return signature;
}

/**
 * @method createMultisignature
 * @param secret string
 * @param secondSecret string
 * @param keysgroup array
 * @param lifetime number
 * @param min number
 * @param timeOffset number
 *
 * @return {Object}
 */

function createMultisignature(secret, secondSecret, keysgroup, lifetime, min, timeOffset) {
  var keys = _crypto2.default.getKeys(secret);
  var keygroupFees = keysgroup.length + 1;

  var transaction = {
    type: 4,
    amount: 0,
    fee: _constants2.default.fees.multisignature * keygroupFees,
    recipientId: null,
    senderPublicKey: keys.publicKey,
    timestamp: _slots2.default.getTimeWithOffset(timeOffset),
    asset: {
      multisignature: {
        min: min,
        lifetime: lifetime,
        keysgroup: keysgroup
      }
    }
  };

  return (0, _utils.prepareTransaction)(transaction, keys, secondSecret);
}

module.exports = {
  signTransaction: signTransaction,
  createMultisignature: createMultisignature,
  createTransaction: createTransaction
};