'use strict';

var _buffer = require('buffer');

var _browserifyBignum = require('browserify-bignum');

var _browserifyBignum2 = _interopRequireDefault(_browserifyBignum);

var _hash = require('./hash');

var _hash2 = _interopRequireDefault(_hash);

var _convert = require('./convert');

var _convert2 = _interopRequireDefault(_convert);

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
function getPrivateAndPublicKeyFromSecret(secret) {
	var sha256Hash = _hash2.default.getSha256Hash(secret, 'utf8');
	var keypair = naclInstance.crypto_sign_seed_keypair(sha256Hash);

	return {
		privateKey: _convert2.default.bufferToHex(_buffer.Buffer.from(keypair.signSk)),
		publicKey: _convert2.default.bufferToHex(_buffer.Buffer.from(keypair.signPk))
	};
}

function getRawPrivateAndPublicKeyFromSecret(secret) {
	var sha256Hash = _hash2.default.getSha256Hash(secret, 'utf8');
	var keypair = naclInstance.crypto_sign_seed_keypair(sha256Hash);

	return {
		privateKey: keypair.signSk,
		publicKey: keypair.signPk
	};
}

function getAddressFromPublicKey(publicKey) {
	var publicKeyHash = _hash2.default.getSha256Hash(publicKey, 'hex');

	var publicKeyTransform = _convert2.default.useFirstEightBufferEntriesReversed(publicKeyHash);
	var address = _browserifyBignum2.default.fromBuffer(publicKeyTransform).toString() + 'L';

	return address;
}

module.exports = {
	getKeypair: getPrivateAndPublicKeyFromSecret,
	getPrivateAndPublicKeyFromSecret: getPrivateAndPublicKeyFromSecret,
	getRawPrivateAndPublicKeyFromSecret: getRawPrivateAndPublicKeyFromSecret,
	getAddressFromPublicKey: getAddressFromPublicKey
};