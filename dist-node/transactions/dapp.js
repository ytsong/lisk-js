'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /*
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
 * Dapp module provides functions used to create dapp registration transactions.
 * @class dapp
 */


var _crypto = require('./crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _constants = require('../constants');

var _constants2 = _interopRequireDefault(_constants);

var _slots = require('../time/slots');

var _slots2 = _interopRequireDefault(_slots);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isInt = function isInt(n) {
	return parseInt(n, 10) === n;
};

var validateOptions = function validateOptions(options) {
	if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
		throw new Error('Options must be an object.');
	}
	var category = options.category,
	    name = options.name,
	    type = options.type,
	    link = options.link;


	if (!isInt(category)) {
		throw new Error('Dapp category must be an integer.');
	}
	if (typeof name !== 'string') {
		throw new Error('Dapp name must be a string.');
	}
	if (!isInt(type)) {
		throw new Error('Dapp type must be an integer.');
	}
	if (typeof link !== 'string') {
		throw new Error('Dapp link must be a string.');
	}
};

/**
 * @method createDapp
 * @param secret
 * @param secondSecret
 * @param options
 * @param timeOffset
 *
 * @return {Object}
 */

function createDapp(secret, secondSecret, options, timeOffset) {
	validateOptions(options);

	var keys = _crypto2.default.getKeys(secret);

	var transaction = {
		type: 5,
		amount: 0,
		fee: _constants2.default.fees.dapp,
		recipientId: null,
		senderPublicKey: keys.publicKey,
		timestamp: _slots2.default.getTimeWithOffset(timeOffset),
		asset: {
			dapp: {
				category: options.category,
				name: options.name,
				description: options.description,
				tags: options.tags,
				type: options.type,
				link: options.link,
				icon: options.icon
			}
		}
	};

	return (0, _utils.prepareTransaction)(transaction, keys, secondSecret);
}

module.exports = {
	createDapp: createDapp
};