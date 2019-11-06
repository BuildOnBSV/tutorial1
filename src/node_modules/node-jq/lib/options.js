'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseOptions = exports.optionDefaults = undefined;

var _utils = require('./utils');

var optionDefaults = exports.optionDefaults = {
  input: 'file',
  output: 'pretty',
  slurp: false,
  sort: false
};

var optionMap = {
  input: {
    buildParams: function buildParams(filter, json, params, value) {
      if (value === 'file') {
        var path = params[params.length - 1];
        if (Array.isArray(path)) {
          params.pop();
          path.forEach(function (file) {
            (0, _utils.validateJSONPath)(file);
            params.push(file);
          });
        } else {
          (0, _utils.validateJSONPath)(params[params.length - 1]);
        }
      } else {
        params.pop();
        params.unshift('--null-input');
        if (value === 'json') {
          json = JSON.stringify(json);
        }
        params[params.length - 1] = json + ' | ' + filter;
      }
    }
  },
  output: {
    buildParams: function buildParams(filter, json, params, value) {
      if (value === 'string' || value === 'compact') {
        params.unshift('--compact-output');
      }
    }
  },
  slurp: {
    buildParams: function buildParams(filter, json, params, value) {
      if (value === true) {
        params.unshift('--slurp');
      }
    }
  },
  sort: {
    buildParams: function buildParams(filter, json, params, value) {
      if (value === true) {
        params.unshift('--sort-keys');
      }
    }
  },
  color: {
    buildParams: function buildParams(filter, json, params, value) {
      if (value === true) {
        params.unshift('--color-output');
      }
    }
  }
};

var mergeOptionDefaults = function mergeOptionDefaults() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  Object.keys(optionDefaults).forEach(function (key) {
    if (options[key] === undefined) {
      options[key] = optionDefaults[key];
    }
  });
};

var parseOptions = exports.parseOptions = function parseOptions(filter, json) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  mergeOptionDefaults(options);
  return Object.keys(options).reduce(function (params, key, index) {
    if (optionMap[key] !== undefined) {
      optionMap[key].buildParams(filter, json, params, options[key]);
    }
    return params;
  }, [filter, json]);
};