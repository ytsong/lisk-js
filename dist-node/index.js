'use strict';

require('babel-polyfill');

var _jsNacl = require('js-nacl');

var _jsNacl2 = _interopRequireDefault(_jsNacl);

var _buffer = require('buffer');

var _buffer2 = _interopRequireDefault(_buffer);

var _crypto = require('./transactions/crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _dapp = require('./transactions/dapp');

var _dapp2 = _interopRequireDefault(_dapp);

var _delegate = require('./transactions/delegate');

var _delegate2 = _interopRequireDefault(_delegate);

var _multisignature = require('./transactions/multisignature');

var _multisignature2 = _interopRequireDefault(_multisignature);

var _signature = require('./transactions/signature');

var _signature2 = _interopRequireDefault(_signature);

var _transaction = require('./transactions/transaction');

var _transaction2 = _interopRequireDefault(_transaction);

var _transfer = require('./transactions/transfer');

var _transfer2 = _interopRequireDefault(_transfer);

var _vote = require('./transactions/vote');

var _vote2 = _interopRequireDefault(_vote);

var _liskApi = require('./api/liskApi');

var _liskApi2 = _interopRequireDefault(_liskApi);

var _slots = require('./time/slots');

var _slots2 = _interopRequireDefault(_slots);

var _mnemonic = require('./utils/mnemonic');

var _mnemonic2 = _interopRequireDefault(_mnemonic);

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
/**
 * Index module comprising all submodules of lisk-js.
 * @module lisk
 * @main lisk
 */
global.Buffer = global.Buffer || _buffer2.default.Buffer;

global.naclFactory = _jsNacl2.default;

global.naclInstance = null;
_jsNacl2.default.instantiate(function (nacl) {
  naclInstance = nacl;
});

var lisk = {
  crypto: _crypto2.default,
  dapp: _dapp2.default,
  delegate: _delegate2.default,
  multisignature: _multisignature2.default,
  signature: _signature2.default,
  transaction: _transaction2.default,
  transfer: _transfer2.default,
  vote: _vote2.default,
  api: _liskApi2.default,
  slots: _slots2.default,
  mnemonic: _mnemonic2.default
};

module.exports = lisk;