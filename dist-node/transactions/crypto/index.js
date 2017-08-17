'use strict';

var _convert = require('./convert');

var _convert2 = _interopRequireDefault(_convert);

var _sign = require('./sign');

var _sign2 = _interopRequireDefault(_sign);

var _keys = require('./keys');

var _keys2 = _interopRequireDefault(_keys);

var _hash = require('./hash');

var _hash2 = _interopRequireDefault(_hash);

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
module.exports = {
	bufferToHex: _convert2.default.bufferToHex,
	hexToBuffer: _convert2.default.hexToBuffer,
	useFirstEightBufferEntriesReversed: _convert2.default.useFirstEightBufferEntriesReversed,
	verifyMessageWithPublicKey: _sign2.default.verifyMessageWithPublicKey,
	signMessageWithSecret: _sign2.default.signMessageWithSecret,
	signAndPrintMessage: _sign2.default.signAndPrintMessage,
	printSignedMessage: _sign2.default.printSignedMessage,
	encryptMessageWithSecret: _sign2.default.encryptMessageWithSecret,
	decryptMessageWithSecret: _sign2.default.decryptMessageWithSecret,
	convertPublicKeyEd2Curve: _sign2.default.convertPublicKeyEd2Curve,
	convertPrivateKeyEd2Curve: _sign2.default.convertPrivateKeyEd2Curve,
	getPrivateAndPublicKeyFromSecret: _keys2.default.getPrivateAndPublicKeyFromSecret,
	getRawPrivateAndPublicKeyFromSecret: _keys2.default.getRawPrivateAndPublicKeyFromSecret,
	getAddressFromPublicKey: _keys2.default.getAddressFromPublicKey,
	getSha256Hash: _hash2.default.getSha256Hash,
	toAddress: _convert2.default.toAddress,
	signMessageWithTwoSecrets: _sign2.default.signMessageWithTwoSecrets,
	verifyMessageWithTwoPublicKeys: _sign2.default.verifyMessageWithTwoPublicKeys
};