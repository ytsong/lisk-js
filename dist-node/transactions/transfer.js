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
 * @method createInTransfer
 * @param dappId
 * @param amount
 * @param secret
 * @param secondSecret
 * @param timeOffset
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
 * Transfer module provides functions for creating "in" transfer transactions (balance transfers to
 * an individual dapp account).
 * @class transfer
 */
function createInTransfer(dappId, amount, secret, secondSecret, timeOffset) {
  var keys = _crypto2.default.getKeys(secret);

  var transaction = {
    type: 6,
    amount: amount,
    fee: _constants2.default.fees.send,
    recipientId: null,
    senderPublicKey: keys.publicKey,
    timestamp: _slots2.default.getTimeWithOffset(timeOffset),
    asset: {
      inTransfer: {
        dappId: dappId
      }
    }
  };

  return (0, _utils.prepareTransaction)(transaction, keys, secondSecret);
}

/**
 * @method createOutTransfer
 * @param dappId
 * @param transactionId
 * @param recipientId
 * @param amount
 * @param secret
 * @param secondSecret
 * @param timeOffset
 *
 * @return {Object}
 */

function createOutTransfer(dappId, transactionId, recipientId, amount, secret, secondSecret, timeOffset) {
  var keys = _crypto2.default.getKeys(secret);

  var transaction = {
    type: 7,
    amount: amount,
    fee: _constants2.default.fees.send,
    recipientId: recipientId,
    senderPublicKey: keys.publicKey,
    timestamp: _slots2.default.getTimeWithOffset(timeOffset),
    asset: {
      outTransfer: {
        dappId: dappId,
        transactionId: transactionId
      }
    }
  };

  return (0, _utils.prepareTransaction)(transaction, keys, secondSecret);
}

module.exports = {
  createInTransfer: createInTransfer,
  createOutTransfer: createOutTransfer
};