'use strict';

var _crypto = require('../transactions/crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _dapp = require('../transactions/dapp');

var _dapp2 = _interopRequireDefault(_dapp);

var _multisignature = require('../transactions/multisignature');

var _multisignature2 = _interopRequireDefault(_multisignature);

var _signature = require('../transactions/signature');

var _signature2 = _interopRequireDefault(_signature);

var _delegate = require('../transactions/delegate');

var _delegate2 = _interopRequireDefault(_delegate);

var _transaction = require('../transactions/transaction');

var _transaction2 = _interopRequireDefault(_transaction);

var _transfer = require('../transactions/transfer');

var _transfer2 = _interopRequireDefault(_transfer);

var _vote = require('../transactions/vote');

var _vote2 = _interopRequireDefault(_vote);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
var LiskJS = {
	crypto: _crypto2.default,
	dapp: _dapp2.default,
	multisignature: _multisignature2.default,
	signature: _signature2.default,
	delegate: _delegate2.default,
	transaction: _transaction2.default,
	transfer: _transfer2.default,
	vote: _vote2.default
};

/**
 * ParseOfflineRequest module provides automatic routing of new transaction requests which can be
 * signed locally, and then broadcast without any passphrases being transmitted.
 *
 * @method ParseOfflineRequest
 * @param requestType
 * @param options
 * @main lisk
 */

function ParseOfflineRequest(requestType, options) {
	if (!(this instanceof ParseOfflineRequest)) {
		return new ParseOfflineRequest(requestType, options);
	}

	this.requestType = requestType;
	this.options = options;
	this.requestMethod = this.httpGETPUTorPOST(requestType);
	this.params = '';

	return this;
}

/**
 * @method checkDoubleNamedAPI
 * @param requestType string
 * @param options
 * @return string
 */

ParseOfflineRequest.prototype.checkDoubleNamedAPI = function checkDoubleNamedAPI(requestType, options) {
	return (requestType === 'transactions' || requestType === 'accounts/delegates') && options && !options.secret ? 'getTransactions' : requestType;
};

/**
 * @method httpGETPUTorPOST
 * @param requestType string
 * @return string
 */

ParseOfflineRequest.prototype.httpGETPUTorPOST = function httpGETPUTorPOST(providedRequestType) {
	var requestType = this.checkDoubleNamedAPI(providedRequestType, this.options);

	var requestMethod = void 0;
	var requestIdentification = {
		'accounts/open': 'POST',
		'accounts/generatePublicKey': 'POST',
		'delegates/forging/enable': 'NOACTION',
		'delegates/forging/disable': 'NOACTION',
		'dapps/install': 'NOACTION',
		'dapps/uninstall': 'NOACTION',
		'dapps/launch': 'NOACTION',
		'dapps/stop': 'NOACTION',
		'multisignatures/sign': 'POST',
		'accounts/delegates': 'PUT',
		transactions: 'PUT',
		signatures: 'PUT',
		delegates: 'PUT',
		dapps: 'PUT',
		multisignatures: 'POST'
	};

	if (!requestIdentification[requestType]) {
		requestMethod = 'GET';
	} else {
		requestMethod = requestIdentification[requestType];
	}

	return requestMethod;
};

/**
 * @method checkOfflineRequestBefore
 *
 * @return {object}
 */

ParseOfflineRequest.prototype.checkOfflineRequestBefore = function checkOfflineRequestBefore() {
	var accountKeys = this.options.secret ? LiskJS.crypto.getKeys(this.options.secret) : {};
	var accountAddress = accountKeys.publicKey ? LiskJS.crypto.getAddress(accountKeys.publicKey) : '';

	var OfflineRequestThis = this;
	var requestIdentification = {
		'accounts/open': function getAccountsOpen() {
			return {
				requestMethod: 'GET',
				requestUrl: 'accounts?address=' + accountAddress
			};
		},
		'accounts/generatePublicKey': function getAccountsGeneratePublicKey() {
			return {
				requestMethod: 'GET',
				requestUrl: 'accounts?address=' + accountAddress
			};
		},
		'delegates/forging/enable': 'POST',
		'delegates/forging/disable': 'POST',
		'dapps/install': 'POST',
		'dapps/uninstall': 'POST',
		'dapps/launch': 'POST',
		'dapps/stop': 'POST',
		'multisignatures/sign': function postMultisignaturesSign() {
			var signature = LiskJS.multisignature.signTransaction(OfflineRequestThis.options.transaction, OfflineRequestThis.options.secret);

			return {
				requestMethod: 'POST',
				requestUrl: 'signatures',
				params: { signature: signature }
			};
		},
		'accounts/delegates': function postAccountsDelegates() {
			var transaction = LiskJS.vote.createVote(OfflineRequestThis.options.secret, OfflineRequestThis.options.delegates, OfflineRequestThis.options.secondSecret, OfflineRequestThis.options.timeOffset);

			return {
				requestMethod: 'POST',
				requestUrl: 'transactions',
				params: { transaction: transaction }
			};
		},
		transactions: function transactions() {
			var transaction = LiskJS.transaction.createTransaction(OfflineRequestThis.options.recipientId, OfflineRequestThis.options.amount, OfflineRequestThis.options.secret, OfflineRequestThis.options.secondSecret, OfflineRequestThis.options.timeOffset);

			return {
				requestMethod: 'POST',
				requestUrl: 'transactions',
				params: { transaction: transaction }
			};
		},
		signatures: function signatures() {
			var transaction = LiskJS.signature.createSignature(OfflineRequestThis.options.secret, OfflineRequestThis.options.secondSecret, OfflineRequestThis.options.timeOffset);

			return {
				requestMethod: 'POST',
				requestUrl: 'transactions',
				params: { transaction: transaction }
			};
		},
		delegates: function delegates() {
			var transaction = LiskJS.delegate.createDelegate(OfflineRequestThis.options.secret, OfflineRequestThis.options.username, OfflineRequestThis.options.secondSecret, OfflineRequestThis.options.timeOffset);
			return {
				requestMethod: 'POST',
				requestUrl: 'transactions',
				params: { transaction: transaction }
			};
		},
		dapps: function dapps() {
			var DappOptions = {
				category: OfflineRequestThis.options.category,
				name: OfflineRequestThis.options.name,
				description: OfflineRequestThis.options.description,
				tags: OfflineRequestThis.options.tags,
				type: OfflineRequestThis.options.type,
				link: OfflineRequestThis.options.link,
				icon: OfflineRequestThis.options.icon,
				secret: OfflineRequestThis.options.secret,
				secondSecret: OfflineRequestThis.options.secondSecret
			};

			var transaction = LiskJS.dapp.createDapp(DappOptions);

			return {
				requestMethod: 'POST',
				requestUrl: 'transactions',
				params: { transaction: transaction }
			};
		},
		multisignatures: function multisignatures() {
			var transaction = LiskJS.multisignature.createMultisignature(OfflineRequestThis.options.secret, OfflineRequestThis.options.secondSecret, OfflineRequestThis.options.keysgroup, OfflineRequestThis.options.lifetime, OfflineRequestThis.options.min, OfflineRequestThis.options.timeOffset);

			return {
				requestMethod: 'POST',
				requestUrl: 'transactions',
				params: { transaction: transaction }
			};
		}
	};

	return requestIdentification[this.requestType]();
};

/**
 * @method transactionOutputAfter
 * @param requestAnswer
 *
 * @return {object}
 */

ParseOfflineRequest.prototype.transactionOutputAfter = function transactionOutputAfter(requestAnswer) {
	var accountKeys = LiskJS.crypto.getKeys(this.options.secret);
	var accountAddress = LiskJS.crypto.getAddress(accountKeys.publicKey);

	var transformAnswer = void 0;
	var requestIdentification = {
		'accounts/open': function transformAccountsOpen() {
			if (requestAnswer.error === 'Account not found') {
				transformAnswer = {
					success: 'true',
					account: {
						address: accountAddress,
						unconfirmedBalance: '0',
						balance: '0',
						publicKey: accountKeys.publicKey,
						unconfirmedSignature: '0',
						secondSignature: '0',
						secondPublicKey: null,
						multisignatures: null,
						u_multisignatures: null // eslint-disable-line camelcase
					}
				};
			} else {
				transformAnswer = requestAnswer;
			}

			return transformAnswer;
		},
		'accounts/generatePublicKey': function transformAccountsGeneratePublicKey() {
			return {
				success: 'true',
				publicKey: accountKeys.publicKey
			};
		},
		'delegates/forging/enable': function transformDelegatesForgingEnable() {
			return {
				success: 'false',
				error: 'Forging not available via offlineRequest'
			};
		},
		'delegates/forging/disable': function transformDelegatesForgingDisable() {
			return {
				success: 'false',
				error: 'Forging not available via offlineRequest'
			};
		},
		'dapps/install': function transformDappsInstall() {
			return {
				success: 'false',
				error: 'Install dapp not available via offlineRequest'
			};
		},
		'dapps/uninstall': function transformDappsUninstall() {
			return {
				success: 'false',
				error: 'Uninstall dapp not available via offlineRequest'
			};
		},
		'dapps/launch': function transformDappsLaunch() {
			return {
				success: 'false',
				error: 'Launch dapp not available via offlineRequest'
			};
		},
		'dapps/stop': function transformDappsStop() {
			return {
				success: 'false',
				error: 'Stop dapp not available via offlineRequest'
			};
		},
		'multisignatures/sign': function transformMultisignaturesSign() {
			return requestAnswer;
		},
		'accounts/delegates': function transformAccountsDelegates() {
			return requestAnswer;
		},
		transactions: function transactions() {
			return requestAnswer;
		},
		signatures: function signatures() {
			return requestAnswer;
		},
		delegates: function delegates() {
			return requestAnswer;
		},
		dapps: function dapps() {
			return requestAnswer;
		},
		multisignatures: function multisignatures() {
			return requestAnswer;
		}
	};

	return requestIdentification[this.requestType]();
};

module.exports = ParseOfflineRequest;