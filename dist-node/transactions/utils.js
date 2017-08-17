'use strict';

var _crypto = require('./crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var secondSignTransaction = function secondSignTransaction(transactionObject, secondSecret) {
	var secondKeys = _crypto2.default.getKeys(secondSecret);
	return Object.assign({}, transactionObject, {
		signSignature: _crypto2.default.secondSign(transactionObject, secondKeys)
	});
}; /*
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


var prepareTransaction = function prepareTransaction(transaction, keys, secondSecret) {
	var singleSignedTransaction = Object.assign({}, transaction, {
		signature: _crypto2.default.sign(transaction, keys)
	});

	var signedTransaction = typeof secondSecret === 'string' && transaction.type !== 1 ? secondSignTransaction(singleSignedTransaction, secondSecret) : singleSignedTransaction;

	var transactionWithId = Object.assign({}, signedTransaction, {
		id: _crypto2.default.getId(signedTransaction)
	});

	return transactionWithId;
};

module.exports = {
	prepareTransaction: prepareTransaction
};