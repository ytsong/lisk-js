'use strict';

var _privateApi = require('./privateApi');

var _privateApi2 = _interopRequireDefault(_privateApi);

var _config = require('../../config.json');

var _config2 = _interopRequireDefault(_config);

var _utils = require('./utils');

var _crypto = require('../transactions/crypto');

var _crypto2 = _interopRequireDefault(_crypto);

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
 * LiskAPI module provides functions for interfacing with the Lisk network.
 * Providing mechanisms for:
 *
 * - Retrieval of blockchain data: accounts, blocks, transactions.
 * - Enhancing Lisk security by local signing of transactions and immediate network transmission.
 * - Connecting to Lisk peers or to localhost instance of Lisk core.
 * - Configurable network settings to work in different Lisk environments.
 *
 *     var options = {
 *         ssl: false,
 *         node: '',
 *         randomPeer: true,
 *         testnet: true,
 *         port: '7000',
 *         bannedPeers: [],
 *         peers: [],
 *         nethash: ''
 *     };
 *
 *     var lisk = require('lisk-js');
 *     var LSK = lisk.api(options);
 *
 * @class lisk.api()
 * @main lisk
 */
var LiskJS = {
  crypto: _crypto2.default
};
var GET = 'GET';
var POST = 'POST';

function LiskAPI() {
  var providedOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!(this instanceof LiskAPI)) {
    return new LiskAPI(providedOptions);
  }

  var options = (0, _utils.extend)(_config2.default.options, providedOptions);
  var getDefaultPort = function getDefaultPort() {
    if (options.testnet) return 7000;
    if (options.ssl) return 443;
    return 8000;
  };

  this.defaultPeers = options.peers || _config2.default.peers.mainnet;

  this.defaultSSLPeers = this.defaultPeers;

  this.defaultTestnetPeers = options.peers || _config2.default.peers.testnet;

  this.options = options;
  this.ssl = options.ssl;
  // Random peer can be set by settings with randomPeer: true | false
  // Random peer is automatically enabled when no options.node has been entered. Else will be set
  // to false.
  // If the desired behaviour is to have an own node and automatic peer discovery, randomPeer
  // should be set to true explicitly
  this.randomPeer = typeof options.randomPeer === 'boolean' ? options.randomPeer : !options.node;
  this.testnet = options.testnet;
  this.bannedPeers = options.bannedPeers;
  this.currentPeer = options.node || _privateApi2.default.selectNode.call(this);
  this.port = options.port === '' || options.port ? options.port : getDefaultPort(options);
  this.nethash = this.getNethash(options.nethash);
}

/**
 * @method getNethash
 * @return {object}
 * @public
 */

LiskAPI.prototype.getNethash = function getNethash(providedNethash) {
  var NetHash = this.testnet ? _privateApi2.default.netHashOptions.call(this).testnet : _privateApi2.default.netHashOptions.call(this).mainnet;

  if (providedNethash) {
    NetHash.nethash = providedNethash;
    NetHash.version = '0.0.0a';
  }

  return NetHash;
};

/**
 * @method getPeers
 * @return {object}
 */

LiskAPI.prototype.getPeers = function getPeers() {
  return {
    official: this.defaultPeers.map(function (node) {
      return { node: node };
    }),
    ssl: this.defaultSSLPeers.map(function (node) {
      return { node: node, ssl: true };
    }),
    testnet: this.defaultTestnetPeers.map(function (node) {
      return { node: node, testnet: true };
    })
  };
};

/**
 * @method setNode
 * @param node string
 * @return {object}
 */

LiskAPI.prototype.setNode = function setNode(node) {
  this.currentPeer = node || _privateApi2.default.selectNode.call(this);
  return this.currentPeer;
};

/**
 * @method setTestnet
 * @param testnet boolean
 */

LiskAPI.prototype.setTestnet = function setTestnet(testnet) {
  if (this.testnet !== testnet) {
    this.testnet = testnet;
    this.bannedPeers = [];
    this.port = 7000;
    _privateApi2.default.selectNode.call(this);
  } else {
    this.testnet = false;
    this.bannedPeers = [];
    this.port = 8000;
    _privateApi2.default.selectNode.call(this);
  }
};

/**
 * @method setSSL
 * @param ssl boolean
 */

LiskAPI.prototype.setSSL = function setSSL(ssl) {
  if (this.ssl !== ssl) {
    this.ssl = ssl;
    this.bannedPeers = [];
    _privateApi2.default.selectNode.call(this);
  }
};

function handleTimestampIsInFutureFailures(requestMethod, requestType, options, result) {
  if (!result.success && result.message && result.message.match(/Timestamp is in the future/) && !(options.timeOffset > 40)) {
    var newOptions = {};

    Object.keys(options).forEach(function (key) {
      newOptions[key] = options[key];
    });
    newOptions.timeOffset = (options.timeOffset || 0) + 10;

    return this.sendRequest(requestMethod, requestType, newOptions);
  }
  return Promise.resolve(result);
}

function handleSendRequestFailures(requestMethod, requestType, options, error) {
  var that = this;
  if (_privateApi2.default.checkReDial.call(that)) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        _privateApi2.default.banNode.call(that);
        that.setNode();
        that.sendRequest(requestMethod, requestType, options).then(resolve, reject);
      }, 1000);
    });
  }
  return Promise.resolve({
    success: false,
    error: error,
    message: 'could not create http request to any of the given peers'
  });
}

function optionallyCallCallback(callback, result) {
  if (callback && typeof callback === 'function') {
    callback(result);
  }
  return result;
}

/**
 * @method sendRequest
 * @param requestMethod
 * @param requestType
 * @param optionsOrCallback
 * @param callbackIfOptions
 *
 * @return APIanswer Object
 */

LiskAPI.prototype.sendRequest = function sendRequest() {
  var requestMethod = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : GET;
  var requestType = arguments[1];
  var optionsOrCallback = arguments[2];
  var callbackIfOptions = arguments[3];

  var callback = callbackIfOptions || optionsOrCallback;
  var options = typeof optionsOrCallback !== 'function' && typeof optionsOrCallback !== 'undefined' ? _privateApi2.default.checkOptions.call(this, optionsOrCallback) : {};
  return _privateApi2.default.sendRequestPromise.call(this, requestMethod, requestType, options).then(function (result) {
    return result.body;
  }).then(handleTimestampIsInFutureFailures.bind(this, requestMethod, requestType, options)).catch(handleSendRequestFailures.bind(this, requestMethod, requestType, options)).then(optionallyCallCallback.bind(this, callback));
};

/**
 * @method getAddressFromSecret
 * @param secret
 *
 * @return keys object
 */

LiskAPI.prototype.getAddressFromSecret = function getAddressFromSecret(secret) {
  var accountKeys = LiskJS.crypto.getKeys(secret);
  var accountAddress = LiskJS.crypto.getAddress(accountKeys.publicKey);

  return {
    address: accountAddress,
    publicKey: accountKeys.publicKey
  };
};

/**
 * @method getAccount
 * @param address
 * @param optionsOrCallback
 * @param callbackIfOptions
 *
 * @return API object
 */

LiskAPI.prototype.getAccount = _privateApi2.default.wrapSendRequest(GET, 'accounts', function (address) {
  return { address: address };
});

/**
 * @method getActiveDelegates
 * @param limit
 * @param optionsOrCallback
 * @param callbackIfOptions
 *
 * @return API object
 */

LiskAPI.prototype.getActiveDelegates = _privateApi2.default.wrapSendRequest(GET, 'delegates', function (limit) {
  return { limit: limit };
});

/**
 * @method getStandbyDelegates
 * @param limit
 * @param optionsOrCallback
 * @param callbackIfOptions
 *
 * @return API object
 */

LiskAPI.prototype.getStandbyDelegates = _privateApi2.default.wrapSendRequest(GET, 'delegates', function (limit, _ref) {
  var _ref$orderBy = _ref.orderBy,
      orderBy = _ref$orderBy === undefined ? 'rate:asc' : _ref$orderBy,
      _ref$offset = _ref.offset,
      offset = _ref$offset === undefined ? 101 : _ref$offset;
  return { limit: limit, orderBy: orderBy, offset: offset };
});

/**
 * @method searchDelegateByUsername
 * @param username
 * @param optionsOrCallback
 * @param callbackIfOptions
 *
 * @return API object
 */

LiskAPI.prototype.searchDelegatesByUsername = _privateApi2.default.wrapSendRequest(GET, 'delegates', function (search) {
  return { search: search };
});

/**
 * @method getBlocks
 * @param limit
 * @param optionsOrCallback
 * @param callbackIfOptions
 *
 * @return API object
 */

LiskAPI.prototype.getBlocks = _privateApi2.default.wrapSendRequest(GET, 'blocks', function (limit) {
  return { limit: limit };
});

/**
 * @method getForgedBlocks
 * @param generatorPublicKey
 * @param optionsOrCallback
 * @param callbackIfOptions
 *
 * @return API object
 */

LiskAPI.prototype.getForgedBlocks = _privateApi2.default.wrapSendRequest(GET, 'blocks', function (generatorPublicKey) {
  return { generatorPublicKey: generatorPublicKey };
});

/**
 * @method getBlock
 * @param height
 * @param optionsOrCallback
 * @param callbackIfOptions
 *
 * @return API object
 */

LiskAPI.prototype.getBlock = _privateApi2.default.wrapSendRequest(GET, 'blocks', function (height) {
  return { height: height };
});

/**
 * @method getTransactions
 * @param recipientId
 * @param optionsOrCallback
 * @param callbackIfOptions
 *
 * @return API object
 */

LiskAPI.prototype.getTransactions = _privateApi2.default.wrapSendRequest(GET, 'transactions', function (recipientId) {
  return { recipientId: recipientId };
});

/**
 * @method getTransaction
 * @param transactionId
 * @param optionsOrCallback
 * @param callbackIfOptions
 *
 * @return API object
 */

LiskAPI.prototype.getTransaction = _privateApi2.default.wrapSendRequest(GET, 'transactions', function (transactionId) {
  return { transactionId: transactionId };
});

/**
 * @method getVotes
 * @param address
 * @param optionsOrCallback
 * @param callbackIfOptions
 *
 * @return API object
 */

LiskAPI.prototype.getVotes = _privateApi2.default.wrapSendRequest(GET, 'votes', function (address) {
  return { address: address };
});

/**
 * @method getVoters
 * @param username
 * @param optionsOrCallback
 * @param callbackIfOptions
 *
 * @return API object
 */

LiskAPI.prototype.getVoters = _privateApi2.default.wrapSendRequest(GET, 'voters', function (username) {
  return { username: username };
});

/**
 * @method getUnsignedMultisignatureTransactions
 * @param data
 * @param optionsOrCallback
 * @param callbackIfOptions
 *
 * @return API object
 */

LiskAPI.prototype.getUnsignedMultisignatureTransactions = _privateApi2.default.wrapSendRequest(GET, 'transactions/unsigned', function (data) {
  return data;
});

/**
 * @method sendLSK
 * @param recipientId
 * @param amount
 * @param secret
 * @param secondSecret
 * @param callback
 *
 * @return API object
 */

LiskAPI.prototype.sendLSK = function sendLSK(recipientId, amount, secret, secondSecret, callback) {
  return this.sendRequest(POST, 'transactions', { recipientId: recipientId, amount: amount, secret: secret, secondSecret: secondSecret }, callback);
};

/**
 * @method broadcastSignedTransaction
 * @param transaction
 * @param callback
 *
 * @return API object
 */

LiskAPI.prototype.broadcastSignedTransaction = function broadcastSignedTransaction(transaction, callback) {
  var request = {
    requestMethod: POST,
    requestUrl: _privateApi2.default.getFullUrl.call(this) + '/api/transactions',
    nethash: this.nethash,
    requestParams: { transaction: transaction }
  };

  _privateApi2.default.sendRequestPromise.call(this, POST, request).then(function (result) {
    return callback(result.body);
  });
};

module.exports = LiskAPI;