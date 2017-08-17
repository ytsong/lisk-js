'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
	/**
  * @method trimObj
  * @param obj
  *
  * @return trimmed object
  */
	trimObj: function trimObj(obj) {
		var isArray = Array.isArray(obj);
		if (!isArray && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') {
			return Number.isInteger(obj) ? obj.toString() : obj;
		}

		var trim = function trim(value) {
			return typeof value === 'string' ? value.trim() : trimObj(value);
		};

		return isArray ? obj.map(trim) : Object.entries(obj).reduce(function (accumulator, _ref) {
			var _ref2 = _slicedToArray(_ref, 2),
			    key = _ref2[0],
			    value = _ref2[1];

			var trimmedKey = trim(key);
			var trimmedValue = trim(value);
			return Object.assign({}, accumulator, _defineProperty({}, trimmedKey, trimmedValue));
		}, {});
	},
	/**
  * @method toQueryString
  * @param obj
  *
  * @return query string
  */
	toQueryString: function toQueryString(obj) {
		var parts = Object.entries(obj).reduce(function (accumulator, _ref3) {
			var _ref4 = _slicedToArray(_ref3, 2),
			    key = _ref4[0],
			    value = _ref4[1];

			return [].concat(_toConsumableArray(accumulator), [encodeURIComponent(key) + '=' + encodeURI(value)]);
		}, []);

		return parts.join('&');
	},


	/**
  * Extend a JavaScript object with the key/value pairs of another.
  * @method extend
  * @param obj
  * @param src
  *
  * @return obj Object
  */
	extend: function extend(obj, src) {
		// clone settings
		var cloneObj = JSON.parse(JSON.stringify(obj));
		Object.keys(src).forEach(function (key) {
			cloneObj[key] = src[key];
		});
		return cloneObj;
	}
};