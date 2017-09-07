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
import { getTransactionHash, getSha256Hash } from '../../src/crypto/hash';

const transactionBytes = require('../../src/transactions/transactionBytes');

describe('hash', () => {
	describe('#getSha256Hash', () => {
		const defaultText = 'text123*';
		const defaultHash = Buffer.from('7607d6792843d6003c12495b54e34517a508d2a8622526aff1884422c5478971', 'hex');
		const arrayToHash = [1, 2, 3];

		it('should generate a sha256 hash from buffer', () => {
			const testBuffer = Buffer.from(defaultText);
			const hash = getSha256Hash(testBuffer);
			(Buffer.from(hash)).should.be.eql(defaultHash);
		});

		it('should generate a sha256 hash from utf8 string', () => {
			const hash = getSha256Hash(defaultText, 'utf8');
			(Buffer.from(hash)).should.be.eql(defaultHash);
		});

		it('should generate a sha256 hash from hex string', () => {
			const testHex = Buffer.from(defaultText).toString('hex');
			const hash = getSha256Hash(testHex, 'hex');
			(Buffer.from(hash)).should.be.eql(defaultHash);
		});

		it('should throw on unknown format when trying utf32', () => {
			(getSha256Hash.bind(null, defaultText, 'utf32')).should.throw('Unsupported string format. Currently only `hex` and `utf8` are supported.');
		});

		it('should throw on unknown format when using an array instead of Buffer', () => {
			(getSha256Hash.bind(null, arrayToHash)).should.throw('Unsupported data format. Currently only Buffers or `hex` and `utf8` strings are supported.');
		});
	});

	describe('#getTransactionHash', () => {
		const defaultTransactionBytes = Buffer.from('00aa2902005d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae0900cebcaa8d34153de803000000000000618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0a', 'hex');
		let getTransactionBytesStub;

		beforeEach(() => {
			getTransactionBytesStub = sinon.stub(transactionBytes, 'getTransactionBytes').returns(defaultTransactionBytes);
		});

		afterEach(() => {
			getTransactionBytesStub.restore();
		});

		it('should return a hash for a transaction object as a Uint8Array', () => {
			const transaction = {
				type: 0,
				amount: 1000,
				recipientId: '58191285901858109L',
				timestamp: 141738,
				asset: {},
				senderPublicKey: '5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09',
				signature: '618a54975212ead93df8c881655c625544bce8ed7ccdfe6f08a42eecfb1adebd051307be5014bb051617baf7815d50f62129e70918190361e5d4dd4796541b0a',
				id: '13987348420913138422',
			};
			const result = getTransactionHash(transaction);
			const expected = new Uint8Array(Buffer.from('f60a26da470b1dc233fd526ed7306c1d84836f9e2ecee82c9ec47319e0910474', 'hex'));

			(result).should.be.eql(expected);
		});
	});
});
