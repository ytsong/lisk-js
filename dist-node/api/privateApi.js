'use strict';

var _popsicle = require('popsicle');

var popsicle = _interopRequireWildcard(_popsicle);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
	Object.keys(options).forEach(function (key) {
		var value = options[key];
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
 * @method checkRequest
 * @param requestType
 * @param options
 * @private
 *
 * @return method string
 */

function checkRequest(requestType, options) {
	return this.parseOfflineRequests(requestType, options).requestMethod;
}

function transformGETRequest(baseRequestObject, requestType, options) {
	var requestMethod = 'GET';
	var requestUrlBase = getFullUrl.call(this) + '/api/' + requestType;
	var requestUrl = Object.keys(options).length ? requestUrlBase + serialiseHttpData.call(this, options, requestMethod) : requestUrlBase;
	var requestParams = options;
	return Object.assign({}, baseRequestObject, {
		requestMethod: requestMethod,
		requestUrl: requestUrl,
		requestParams: requestParams
	});
}

function transformPUTOrPOSTRequest(baseRequestObject, requestType, options) {
	var transformRequest = this.parseOfflineRequests(requestType, options).checkOfflineRequestBefore();

	return transformRequest.requestUrl === 'transactions' || transformRequest.requestUrl === 'signatures' ? Object.assign({}, {
		requestUrl: getFullUrl.call(this) + '/peer/' + transformRequest.requestUrl,
		nethash: this.nethash,
		requestMethod: 'POST',
		requestParams: transformRequest.params
	}) : Object.assign({}, baseRequestObject, {
		requestUrl: getFullUrl.call(this) + '/api/' + transformRequest.requestUrl,
		requestMethod: transformRequest.requestMethod,
		requestParams: options
	});
}

/**
 * @method changeRequest
 * @param requestType
 * @param options
 * @private
 *
 * @return httpRequest object
 */

function changeRequest(requestType, options) {
	var defaultRequestObject = {
		requestMethod: '',
		requestUrl: '',
		nethash: '',
		requestParams: ''
	};

	switch (checkRequest.call(this, requestType, options)) {
		case 'GET':
			return transformGETRequest.call(this, defaultRequestObject, requestType, options);
		case 'PUT':
		case 'POST':
			return transformPUTOrPOSTRequest.call(this, defaultRequestObject, requestType, options);
		default:
			return defaultRequestObject;
	}
}

/**
 * @method doPopsicleRequest
 * @param requestValue
 * @private
 *
 * @return APIcall Promise
 */

function doPopsicleRequest(requestValue) {
	return popsicle.request({
		method: requestValue.requestMethod,
		url: requestValue.requestUrl,
		headers: requestValue.nethash,
		body: requestValue.requestMethod !== 'GET' ? requestValue.requestParams : ''
	}).use(popsicle.plugins.parse(['json', 'urlencoded']));
}

/**
 * @method sendRequestPromise
 * @param requestType
 * @param options
 * @private
 *
 * @return APIcall Promise
 */

function sendRequestPromise(requestType, options) {
	if (checkRequest.call(this, requestType, options) !== 'NOACTION') {
		var requestValues = changeRequest.call(this, requestType, options);
		return doPopsicleRequest.call(this, requestValues);
	}
	return new Promise(function (resolve) {
		resolve({ done: 'done' });
	});
}

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
	doPopsicleRequest: doPopsicleRequest,
	changeRequest: changeRequest,
	checkRequest: checkRequest,
	serialiseHttpData: serialiseHttpData
};