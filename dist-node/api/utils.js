'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

		return isArray ? obj.map(trim) : Object.keys(obj).reduce(function (accumulator, key) {
			var trimmedKey = trim(key);
			var trimmedValue = trim(obj[key]);
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
		var parts = Object.keys(obj).reduce(function (accumulator, key) {
			return [].concat(_toConsumableArray(accumulator), [encodeURIComponent(key) + '=' + encodeURI(obj[key])]);
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