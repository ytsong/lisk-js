'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /*
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


var _popsicle = require('popsicle');

var popsicle = _interopRequireWildcard(_popsicle);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var GET = 'GET';

/**
 * @method netHashOptions
 * @return {object}
 * @private
 */

function netHashOptions() {
	return {
		testnet: {
			'Content-Type': 'application/json',
			nethash: 'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba',
			broadhash: 'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba',
			os: 'lisk-js-api',
			version: '1.0.0',
			minVersion: '>=0.5.0',
			port: this.port
		},
		mainnet: {
			'Content-Type': 'application/json',
			nethash: 'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511',
			broadhash: 'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511',
			os: 'lisk-js-api',
			version: '1.0.0',
			minVersion: '>=0.5.0',
			port: this.port
		}
	};
}

/**
 * @method getURLPrefix
 * @return prefix string
 * @private
 */

function getURLPrefix() {
	if (this.ssl) {
		return 'https';
	}
	return 'http';
}

/**
 * @method getFullUrl
 * @return url string
 * @private
 */

function getFullUrl() {
	var nodeUrl = this.currentPeer;

	if (this.port) {
		nodeUrl += ':' + this.port;
	}

	return getURLPrefix.call(this) + '://' + nodeUrl;
}

/**
 * @method getRandomPeer
 * @return peer string
 * @private
 */

function getRandomPeer() {
	var peers = this.ssl ? this.defaultSSLPeers : this.defaultPeers;
	if (this.testnet) peers = this.defaultTestnetPeers;

	var getRandomNumberForPeer = Math.floor(Math.random() * peers.length);
	return peers[getRandomNumberForPeer];
}

/**
 * @method selectNode
 * @return peer string
 * @private
 */

function selectNode() {
	var _this = this;

	var currentRandomPeer = void 0;

	if (this.options.node) {
		currentRandomPeer = this.currentPeer;
	}

	if (this.randomPeer) {
		currentRandomPeer = getRandomPeer.call(this);
		var peers = this.ssl ? this.defaultSSLPeers : this.defaultPeers;
		if (this.testnet) peers = this.defaultTestnetPeers;

		peers.forEach(function () {
			if (_this.bannedPeers.indexOf(currentRandomPeer) === -1) return;
			currentRandomPeer = getRandomPeer.call(_this);
		});
	}

	return currentRandomPeer;
}

/**
 * @method banNode
 * @private
 */

function banNode() {
	if (this.bannedPeers.indexOf(this.currentPeer) === -1) this.bannedPeers.push(this.currentPeer);
	selectNode.call(this);
}

/**
 * @method checkReDial
 * @return reDial boolean
 * @private
 */

function checkReDial() {
	var peers = this.ssl ? this.defaultSSLPeers : this.defaultPeers;
	if (this.testnet) peers = this.defaultTestnetPeers;

	var reconnect = true;

	// RandomPeer discovery explicitly set
	if (this.randomPeer === true) {
		// A nethash has been set by the user. This influences internal redirection
		if (this.options.nethash) {
			// Nethash is equal to testnet nethash, we can proceed to get testnet peers
			if (this.options.nethash === netHashOptions.call(this).testnet.nethash) {
				this.setTestnet(true);
				reconnect = true;
				// Nethash is equal to mainnet nethash, we can proceed to get mainnet peers
			} else if (this.options.nethash === netHashOptions.call(this).mainnet.nethash) {
				this.setTestnet(false);
				reconnect = true;
				// Nethash is neither mainnet nor testnet, do not proceed to get peers
			} else {
				reconnect = false;
			}
			// No nethash set, we can take the usual approach:
			// just when there are not-banned peers, take one
		} else {
			reconnect = peers.length !== this.bannedPeers.length;
		}
		// RandomPeer is not explicitly set, no peer discovery
	} else {
		reconnect = false;
	}

	return reconnect;
}

/**
 * @method checkOptions
 * @return options object
 * @private
 */

function checkOptions(options) {
	Object.entries(options).forEach(function (_ref) {
		var _ref2 = _slicedToArray(_ref, 2),
		    key = _ref2[0],
		    value = _ref2[1];

		if (value === undefined || Number.isNaN(value)) {
			throw new Error('parameter value "' + key + '" should not be ' + value);
		}
	});

	return options;
}

/**
 * @method serialiseHttpData
 * @param data
 *
 * @return serialisedData string
 */

function serialiseHttpData(data) {
	var serialised = void 0;

	serialised = _utils2.default.trimObj(data);
	serialised = _utils2.default.toQueryString(serialised);
	serialised = encodeURI(serialised);

	return '?' + serialised;
}

/**
 * @method createRequestObject
 * @param method
 * @param requestType
 * @param providedOptions
 * @private
 *
 * @return request Object
 */

function createRequestObject(method, requestType, providedOptions) {
	var options = providedOptions || {};
	var url = method === GET ? getFullUrl.call(this) + '/api/' + requestType + serialiseHttpData.call(this, options) : getFullUrl.call(this) + '/api/' + requestType;

	return {
		method: method,
		url: url,
		headers: this.nethash,
		body: method === GET ? {} : options
	};
}

/**
 * @method sendRequestPromise
 * @param requestMethod
 * @param requestType
 * @param options
 * @private
 *
 * @return APIcall Promise
 */

function sendRequestPromise(requestMethod, requestType, options) {
	var requestObject = createRequestObject.call(this, requestMethod, requestType, options);

	return popsicle.request(requestObject).use(popsicle.plugins.parse(['json', 'urlencoded']));
}

/**
 * @method constructRequestData
 * @param providedObject
 * @param optionsOrCallback
 *
 * @return request object
 */

var constructRequestData = function constructRequestData(providedObject, optionsOrCallback) {
	var providedOptions = typeof optionsOrCallback !== 'function' && typeof optionsOrCallback !== 'undefined' ? optionsOrCallback : {};
	return Object.assign({}, providedOptions, providedObject);
};

/**
 * @method wrapSendRequest
 * @param method
 * @param endpoint
 * @param getDataFn
 *
 * @return function wrappedSendRequest
 */

var wrapSendRequest = function wrapSendRequest(method, endpoint, getDataFn) {
	return function wrappedSendRequest(value, optionsOrCallback, callbackIfOptions) {
		var callback = callbackIfOptions || optionsOrCallback;
		var data = constructRequestData(getDataFn(value, optionsOrCallback), optionsOrCallback);
		return this.sendRequest(method, endpoint, data, callback);
	};
};

module.exports = {
	netHashOptions: netHashOptions,
	getFullUrl: getFullUrl,
	getURLPrefix: getURLPrefix,
	selectNode: selectNode,
	getRandomPeer: getRandomPeer,
	banNode: banNode,
	checkReDial: checkReDial,
	checkOptions: checkOptions,
	sendRequestPromise: sendRequestPromise,
	serialiseHttpData: serialiseHttpData,
	createRequestObject: createRequestObject,
	constructRequestData: constructRequestData,
	wrapSendRequest: wrapSendRequest
};