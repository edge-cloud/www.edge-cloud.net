'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _algoliasearchHelper = require('algoliasearch-helper');

var _algoliasearchHelper2 = _interopRequireDefault(_algoliasearchHelper);

var _url = require('algoliasearch-helper/src/url');

var _url2 = _interopRequireDefault(_url);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _assign = require('lodash/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AlgoliaSearchHelper = _algoliasearchHelper2.default.AlgoliaSearchHelper;

function timerMaker(t0) {
  var t = t0;
  return function timer() {
    var now = Date.now();
    var delta = now - t;
    t = now;
    return delta;
  };
}

/**
 * @typedef {object} UrlUtil
 * @property {string} character the character used in the url
 * @property {function} onpopstate add an event listener for the URL change
 * @property {function} pushState creates a new entry in the browser history
 * @property {function} readUrl reads the query string of the parameters
 */

/**
 * Handles the legacy browsers
 * @type {UrlUtil}
 */
var hashUrlUtils = {
  ignoreNextPopState: false,
  character: '#',
  onpopstate: function onpopstate(cb) {
    var _this = this;

    this._onHashChange = function (hash) {
      if (_this.ignoreNextPopState) {
        _this.ignoreNextPopState = false;
        return;
      }

      cb(hash);
    };

    window.addEventListener('hashchange', this._onHashChange);
  },
  pushState: function pushState(qs) {
    // hash change or location assign does trigger an hashchange event
    // so everytime we change it manually, we inform the code
    // to ignore the next hashchange event
    // see https://github.com/algolia/instantsearch.js/issues/2012
    this.ignoreNextPopState = true;
    window.location.assign(getFullURL(this.createURL(qs)));
  },
  createURL: function createURL(qs) {
    return window.location.search + this.character + qs;
  },
  readUrl: function readUrl() {
    return window.location.hash.slice(1);
  },
  dispose: function dispose() {
    window.removeEventListener('hashchange', this._onHashChange);
    window.location.assign(getFullURL(''));
  }
};

/**
 * Handles the modern API
 * @type {UrlUtil}
 */
var modernUrlUtils = {
  character: '?',
  onpopstate: function onpopstate(cb) {
    this._onPopState = function () {
      return cb.apply(undefined, arguments);
    };
    window.addEventListener('popstate', this._onPopState);
  },
  pushState: function pushState(qs, _ref) {
    var getHistoryState = _ref.getHistoryState;

    window.history.pushState(getHistoryState(), '', getFullURL(this.createURL(qs)));
  },
  createURL: function createURL(qs) {
    return this.character + qs + document.location.hash;
  },
  readUrl: function readUrl() {
    return window.location.search.slice(1);
  },
  dispose: function dispose() {
    window.removeEventListener('popstate', this._onPopState);
    window.history.pushState(null, null, getFullURL(''));
  }
};

// we always push the full url to the url bar. Not a relative one.
// So that we handle cases like using a <base href>, see
// https://github.com/algolia/instantsearch.js/issues/790 for the original issue
function getFullURL(relative) {
  return getLocationOrigin() + window.location.pathname + relative;
}

// IE <= 11 has no location.origin or buggy
function getLocationOrigin() {
  // eslint-disable-next-line max-len
  return window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
}

// see InstantSearch.js file for urlSync options

var URLSync = function () {
  function URLSync(urlUtils, options) {
    _classCallCheck(this, URLSync);

    this.urlUtils = urlUtils;
    this.originalConfig = null;
    this.timer = timerMaker(Date.now());
    this.mapping = options.mapping || {};
    this.getHistoryState = options.getHistoryState || function () {
      return null;
    };
    this.threshold = options.threshold || 700;
    this.trackedParameters = options.trackedParameters || ['query', 'attribute:*', 'index', 'page', 'hitsPerPage'];
    this.firstRender = true;

    this.searchParametersFromUrl = AlgoliaSearchHelper.getConfigurationFromQueryString(this.urlUtils.readUrl(), { mapping: this.mapping });
  }

  _createClass(URLSync, [{
    key: 'init',
    value: function init(_ref2) {
      var state = _ref2.state;

      this.initState = state;
    }
  }, {
    key: 'getConfiguration',
    value: function getConfiguration(currentConfiguration) {
      // we need to create a REAL helper to then get its state. Because some parameters
      // like hierarchicalFacet.rootPath are then triggering a default refinement that would
      // be not present if it was not going trough the SearchParameters constructor
      this.originalConfig = (0, _algoliasearchHelper2.default)({
        addAlgoliaAgent: function addAlgoliaAgent() {}
      }, currentConfiguration.index, currentConfiguration).state;
      return this.searchParametersFromUrl;
    }
  }, {
    key: 'render',
    value: function render(_ref3) {
      var _this2 = this;

      var helper = _ref3.helper,
          state = _ref3.state;

      if (this.firstRender) {
        this.firstRender = false;
        this.onHistoryChange(this.onPopState.bind(this, helper));
        helper.on('change', function (s) {
          return _this2.renderURLFromState(s);
        });

        var initStateQs = this.getQueryString(this.initState);
        var stateQs = this.getQueryString(state);
        if (initStateQs !== stateQs) {
          // force update the URL, if the state has changed since the initial URL read
          // We do this in order to make a URL update when there is search function
          // that prevent the search of the initial rendering
          // See: https://github.com/algolia/instantsearch.js/issues/2523#issuecomment-339356157
          this.renderURLFromState(state);
        }
      }
    }
  }, {
    key: 'dispose',
    value: function dispose(_ref4) {
      var helper = _ref4.helper;

      helper.removeListener('change', this.renderURLFromState);
      this.urlUtils.dispose();
    }
  }, {
    key: 'onPopState',
    value: function onPopState(helper, fullState) {
      clearTimeout(this.urlUpdateTimeout);
      // compare with helper.state
      var partialHelperState = helper.getState(this.trackedParameters);
      var fullHelperState = (0, _assign2.default)({}, this.originalConfig, partialHelperState);

      if ((0, _isEqual2.default)(fullHelperState, fullState)) return;

      helper.overrideStateWithoutTriggeringChangeEvent(fullState).search();
    }
  }, {
    key: 'renderURLFromState',
    value: function renderURLFromState(state) {
      var _this3 = this;

      var qs = this.getQueryString(state);
      clearTimeout(this.urlUpdateTimeout);
      this.urlUpdateTimeout = setTimeout(function () {
        _this3.urlUtils.pushState(qs, { getHistoryState: _this3.getHistoryState });
      }, this.threshold);
    }
  }, {
    key: 'getQueryString',
    value: function getQueryString(state) {
      var currentQueryString = this.urlUtils.readUrl();
      var foreignConfig = AlgoliaSearchHelper.getForeignConfigurationInQueryString(currentQueryString, { mapping: this.mapping });

      return _url2.default.getQueryStringFromState(state.filter(this.trackedParameters), {
        moreAttributes: foreignConfig,
        mapping: this.mapping,
        safe: true
      });
    }

    // External API's

  }, {
    key: 'createURL',
    value: function createURL(state, _ref5) {
      var absolute = _ref5.absolute;

      var filteredState = state.filter(this.trackedParameters);

      var relative = this.urlUtils.createURL(_algoliasearchHelper2.default.url.getQueryStringFromState(filteredState, {
        mapping: this.mapping
      }));

      return absolute ? getFullURL(relative) : relative;
    }
  }, {
    key: 'onHistoryChange',
    value: function onHistoryChange(fn) {
      var _this4 = this;

      this.urlUtils.onpopstate(function () {
        var qs = _this4.urlUtils.readUrl();
        var partialState = AlgoliaSearchHelper.getConfigurationFromQueryString(qs, { mapping: _this4.mapping });
        var fullState = (0, _assign2.default)({}, _this4.originalConfig, partialState);
        fn(fullState);
      });
    }
  }]);

  return URLSync;
}();

/**
 * Instanciate a url sync widget. This widget let you synchronize the search
 * parameters with the URL. It can operate with legacy API and hash or it can use
 * the modern history API. By default, it will use the modern API, but if you are
 * looking for compatibility with IE8 and IE9, then you should set 'useHash' to
 * true.
 * @param {object} options all the parameters to configure the URL synchronization. It
 * may contain the following keys :
 *  - threshold:number time in ms after which a new state is created in the browser
 * history. The default value is 700.
 *  - trackedParameters:string[] parameters that will be synchronized in the
 * URL. By default, it will track the query, all the refinable attribute (facets and numeric
 * filters), the index and the page.
 *  - useHash:boolean if set to true, the url will be hash based. Otherwise,
 * it'll use the query parameters using the modern history API.
 * @return {object} the widget instance
 */


function urlSync() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var useHash = options.useHash || false;
  var customUrlUtils = options.urlUtils;

  var urlUtils = customUrlUtils || (useHash ? hashUrlUtils : modernUrlUtils);

  return new URLSync(urlUtils, options);
}

exports.default = urlSync;