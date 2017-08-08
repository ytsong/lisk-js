'use strict';

var _ed2curve = require('ed2curve');

var _ed2curve2 = _interopRequireDefault(_ed2curve);

var _convert = require('./convert');

var _convert2 = _interopRequireDefault(_convert);

var _keys = require('./keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function signMessageWithSecret(message, secret) {
	var msgBytes = naclInstance.encode_utf8(message);
	var keypairBytes = _keys2.default.getRawPrivateAndPublicKeyFromSecret(secret);

	var signedMessage = naclInstance.crypto_sign(msgBytes, keypairBytes.privateKey);
	var hexSignedMessage = _convert2.default.bufferToHex(signedMessage);

	return hexSignedMessage;
} /*
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


function signMessageWithTwoSecrets(message, secret, secondSecret) {
	var msgBytes = naclInstance.encode_utf8(message);
	var keypairBytes = _keys2.default.getRawPrivateAndPublicKeyFromSecret(secret);
	var secondKeypairBytes = _keys2.default.getRawPrivateAndPublicKeyFromSecret(secondSecret);

	var signedMessage = naclInstance.crypto_sign(msgBytes, keypairBytes.privateKey);
	var doubleSignedMessage = naclInstance.crypto_sign(signedMessage, secondKeypairBytes.privateKey);

	var hexSignedMessage = _convert2.default.bufferToHex(doubleSignedMessage);

	return hexSignedMessage;
}

function verifyMessageWithTwoPublicKeys(signedMessage, publicKey, secondPublicKey) {
	var signedMessageBytes = _convert2.default.hexToBuffer(signedMessage);
	var publicKeyBytes = _convert2.default.hexToBuffer(publicKey);
	var secondPublicKeyBytes = _convert2.default.hexToBuffer(secondPublicKey);

	if (publicKeyBytes.length !== 32) {
		throw new Error('Invalid first publicKey, expected 32-byte publicKey');
	}

	if (secondPublicKeyBytes.length !== 32) {
		throw new Error('Invalid second publicKey, expected 32-byte publicKey');
	}

	// Give appropriate error messages from crypto_sign_open
	var openSignature = naclInstance.crypto_sign_open(signedMessageBytes, secondPublicKeyBytes);

	if (openSignature) {
		var openSecondSignature = naclInstance.crypto_sign_open(openSignature, publicKeyBytes);

		if (openSecondSignature) {
			// Returns original message
			return naclInstance.decode_utf8(openSecondSignature);
		}
		throw new Error('Invalid signature second publicKey, cannot verify message');
	} else {
		throw new Error('Invalid signature primary publicKey, cannot verify message');
	}
}

function signAndPrintMessage(message, secret) {
	var signedMessageHeader = '-----BEGIN LISK SIGNED MESSAGE-----';
	var messageHeader = '-----MESSAGE-----';
	var plainMessage = message;
	var pubklicKeyHeader = '-----PUBLIC KEY-----';
	var publicKey = _keys2.default.getPrivateAndPublicKeyFromSecret(secret).publicKey;
	var signatureHeader = '-----SIGNATURE-----';
	var signedMessage = signMessageWithSecret(message, secret);
	var signatureFooter = '-----END LISK SIGNED MESSAGE-----';

	var outputArray = [signedMessageHeader, messageHeader, plainMessage, pubklicKeyHeader, publicKey, signatureHeader, signedMessage, signatureFooter];

	return outputArray.join('\n');
}

function printSignedMessage(message, signedMessage, publicKey) {
	var signedMessageHeader = '-----BEGIN LISK SIGNED MESSAGE-----';
	var messageHeader = '-----MESSAGE-----';
	var publicKeyHeader = '-----PUBLIC KEY-----';
	var signatureHeader = '-----SIGNATURE-----';
	var signatureFooter = '-----END LISK SIGNED MESSAGE-----';

	var outputArray = [signedMessageHeader, messageHeader, message, publicKeyHeader, publicKey, signatureHeader, signedMessage, signatureFooter];

	return outputArray.join('\n');
}

function verifyMessageWithPublicKey(signedMessage, publicKey) {
	var signedMessageBytes = _convert2.default.hexToBuffer(signedMessage);
	var publicKeyBytes = _convert2.default.hexToBuffer(publicKey);

	if (publicKeyBytes.length !== 32) {
		throw new Error('Invalid publicKey, expected 32-byte publicKey');
	}

	// Give appropriate error messages from crypto_sign_open
	var openSignature = naclInstance.crypto_sign_open(signedMessageBytes, publicKeyBytes);

	if (openSignature) {
		// Returns original message
		return naclInstance.decode_utf8(openSignature);
	}
	throw new Error('Invalid signature publicKey combination, cannot verify message');
}

function convertPublicKeyEd2Curve(publicKey) {
	return _ed2curve2.default.convertPublicKey(publicKey);
}

function convertPrivateKeyEd2Curve(privateKey) {
	return _ed2curve2.default.convertSecretKey(privateKey);
}

function encryptMessageWithSecret(message, secret, recipientPublicKey) {
	var senderPrivateKey = _keys2.default.getRawPrivateAndPublicKeyFromSecret(secret).privateKey;
	var convertedPrivateKey = convertPrivateKeyEd2Curve(senderPrivateKey);
	var recipientPublicKeyBytes = _convert2.default.hexToBuffer(recipientPublicKey);
	var convertedPublicKey = convertPublicKeyEd2Curve(recipientPublicKeyBytes);
	var utf8Message = naclInstance.encode_utf8(message);

	var nonce = naclInstance.crypto_box_random_nonce();
	var packet = naclInstance.crypto_box(utf8Message, nonce, convertedPublicKey, convertedPrivateKey);

	var nonceHex = _convert2.default.bufferToHex(nonce);
	var encryptedMessage = _convert2.default.bufferToHex(packet);

	return {
		nonce: nonceHex,
		encryptedMessage: encryptedMessage
	};
}

function decryptMessageWithSecret(packet, nonce, secret, senderPublicKey) {
	var recipientPrivateKey = _keys2.default.getRawPrivateAndPublicKeyFromSecret(secret).privateKey;
	var convertedPrivateKey = convertPrivateKeyEd2Curve(recipientPrivateKey);
	var senderPublicKeyBytes = _convert2.default.hexToBuffer(senderPublicKey);
	var convertedPublicKey = convertPublicKeyEd2Curve(senderPublicKeyBytes);
	var packetBytes = _convert2.default.hexToBuffer(packet);
	var nonceBytes = _convert2.default.hexToBuffer(nonce);

	var decoded = naclInstance.crypto_box_open(packetBytes, nonceBytes, convertedPublicKey, convertedPrivateKey);

	return naclInstance.decode_utf8(decoded);
}

module.exports = {
	verifyMessageWithPublicKey: verifyMessageWithPublicKey,
	signMessageWithSecret: signMessageWithSecret,
	printSignedMessage: printSignedMessage,
	signAndPrintMessage: signAndPrintMessage,
	encryptMessageWithSecret: encryptMessageWithSecret,
	decryptMessageWithSecret: decryptMessageWithSecret,
	convertPublicKeyEd2Curve: convertPublicKeyEd2Curve,
	convertPrivateKeyEd2Curve: convertPrivateKeyEd2Curve,
	signMessageWithTwoSecrets: signMessageWithTwoSecrets,
	verifyMessageWithTwoPublicKeys: verifyMessageWithTwoPublicKeys
};