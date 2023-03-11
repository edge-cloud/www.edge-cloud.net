'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _algoliasearchLite = require('algoliasearch/src/browser/builds/algoliasearchLite.js');

var _algoliasearchLite2 = _interopRequireDefault(_algoliasearchLite);

var _algoliasearchHelper = require('algoliasearch-helper');

var _algoliasearchHelper2 = _interopRequireDefault(_algoliasearchHelper);

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _mergeWith = require('lodash/mergeWith');

var _mergeWith2 = _interopRequireDefault(_mergeWith);

var _union = require('lodash/union');

var _union2 = _interopRequireDefault(_union);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _events = require('events');

var _urlSync = require('./url-sync.js');

var _urlSync2 = _interopRequireDefault(_urlSync);

var _version = require('./version.js');

var _version2 = _interopRequireDefault(_version);

var _createHelpers = require('./createHelpers.js');

var _createHelpers2 = _interopRequireDefault(_createHelpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // we use the fullpath to the lite build to solve a meteor.js issue:
// https://github.com/algolia/instantsearch.js/issues/1024#issuecomment-221618284


function defaultCreateURL() {
  return '#';
}
var defaultCreateAlgoliaClient = function defaultCreateAlgoliaClient(defaultAlgoliasearch, appId, apiKey) {
  return defaultAlgoliasearch(appId, apiKey);
};

/**
 * Widgets are the building blocks of InstantSearch.js. Any
 * valid widget must have at least a `render` or a `init` function.
 * @typedef {Object} Widget
 * @property {function} [render] Called after each search response has been received
 * @property {function} [getConfiguration] Let the widget update the configuration
 * of the search with new parameters
 * @property {function} [init] Called once before the first search
 */

/**
 * The actual implementation of the InstantSearch. This is
 * created using the `instantsearch` factory function.
 * @fires Instantsearch#render This event is triggered each time a render is done
 */

var InstantSearch = function (_EventEmitter) {
  _inherits(InstantSearch, _EventEmitter);

  function InstantSearch(_ref) {
    var _ref$appId = _ref.appId,
        appId = _ref$appId === undefined ? null : _ref$appId,
        _ref$apiKey = _ref.apiKey,
        apiKey = _ref$apiKey === undefined ? null : _ref$apiKey,
        _ref$indexName = _ref.indexName,
        indexName = _ref$indexName === undefined ? null : _ref$indexName,
        numberLocale = _ref.numberLocale,
        _ref$searchParameters = _ref.searchParameters,
        searchParameters = _ref$searchParameters === undefined ? {} : _ref$searchParameters,
        _ref$urlSync = _ref.urlSync,
        urlSync = _ref$urlSync === undefined ? null : _ref$urlSync,
        searchFunction = _ref.searchFunction,
        _ref$createAlgoliaCli = _ref.createAlgoliaClient,
        createAlgoliaClient = _ref$createAlgoliaCli === undefined ? defaultCreateAlgoliaClient : _ref$createAlgoliaCli,
        _ref$stalledSearchDel = _ref.stalledSearchDelay,
        stalledSearchDelay = _ref$stalledSearchDel === undefined ? 200 : _ref$stalledSearchDel;

    _classCallCheck(this, InstantSearch);

    var _this = _possibleConstructorReturn(this, (InstantSearch.__proto__ || Object.getPrototypeOf(InstantSearch)).call(this));

    if (appId === null || apiKey === null || indexName === null) {
      var usage = '\nUsage: instantsearch({\n  appId: \'my_application_id\',\n  apiKey: \'my_search_api_key\',\n  indexName: \'my_index_name\'\n});';
      throw new Error(usage);
    }

    var client = createAlgoliaClient(_algoliasearchLite2.default, appId, apiKey);
    client.addAlgoliaAgent('instantsearch.js ' + _version2.default);

    _this.client = client;
    _this.helper = null;
    _this.indexName = indexName;
    _this.searchParameters = _extends({}, searchParameters, { index: indexName });
    _this.widgets = [];
    _this.templatesConfig = {
      helpers: (0, _createHelpers2.default)({ numberLocale: numberLocale }),
      compileOptions: {}
    };
    _this._stalledSearchDelay = stalledSearchDelay;

    if (searchFunction) {
      _this._searchFunction = searchFunction;
    }

    _this.urlSync = urlSync === true ? {} : urlSync;
    return _this;
  }

  /**
   * Add a widget. This can be done before and after InstantSearch has been started. Adding a
   * widget after InstantSearch started is considered **EXPERIMENTAL** and therefore
   * it is possibly buggy, if you find anything please
   * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20hot%20addWidget).
   * @param  {Widget} widget The widget to add to InstantSearch. Widgets are simple objects
   * that have methods that map the search lifecycle in a UI perspective. Usually widgets are
   * created by [widget factories](widgets.html) like the one provided with InstantSearch.js.
   * @return {undefined} This method does not return anything
   */


  _createClass(InstantSearch, [{
    key: 'addWidget',
    value: function addWidget(widget) {
      this.addWidgets([widget]);
    }

    /**
     * Add multiple widgets. This can be done before and after the InstantSearch has been started. This feature
     * is considered **EXPERIMENTAL** and therefore it is possibly buggy, if you find anything please
     * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20addWidgets).
     * @param  {Widget[]} widgets The array of widgets to add to InstantSearch.
     * @return {undefined} This method does not return anything
     */

  }, {
    key: 'addWidgets',
    value: function addWidgets(widgets) {
      var _this2 = this;

      if (!Array.isArray(widgets)) {
        throw new Error('You need to provide an array of widgets or call `addWidget()`');
      }

      widgets.forEach(function (widget) {
        // Add the widget to the list of widget
        if (widget.render === undefined && widget.init === undefined) {
          throw new Error('Widget definition missing render or init method');
        }

        _this2.widgets.push(widget);
      });

      // Init the widget directly if instantsearch has been already started
      if (this.started) {
        this.searchParameters = this.widgets.reduce(enhanceConfiguration({}), _extends({}, this.helper.state));

        this.helper.setState(this.searchParameters);

        widgets.forEach(function (widget) {
          if (widget.init) {
            widget.init({
              state: _this2.helper.state,
              helper: _this2.helper,
              templatesConfig: _this2.templatesConfig,
              createURL: _this2._createAbsoluteURL,
              onHistoryChange: _this2._onHistoryChange,
              instantSearchInstance: _this2
            });
          }
        });

        this.helper.search();
      }
    }

    /**
     * Removes a widget. This can be done after the InstantSearch has been started. This feature
     * is considered **EXPERIMENTAL** and therefore it is possibly buggy, if you find anything please
     * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20removeWidget).
     * @param  {Widget} widget The widget instance to remove from InstantSearch. This widget must implement a `dipose()` method in order to be gracefully removed.
     * @return {undefined} This method does not return anything
     */

  }, {
    key: 'removeWidget',
    value: function removeWidget(widget) {
      this.removeWidgets([widget]);
    }

    /**
     * Remove multiple widgets. This can be done only after the InstantSearch has been started. This feature
     * is considered **EXPERIMENTAL** and therefore it is possibly buggy, if you find anything please
     * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20addWidgets).
     * @param  {Widget[]} widgets Array of widgets instances to remove from InstantSearch.
     * @return {undefined} This method does not return anything
     */

  }, {
    key: 'removeWidgets',
    value: function removeWidgets(widgets) {
      var _this3 = this;

      if (!Array.isArray(widgets)) {
        throw new Error('You need to provide an array of widgets or call `removeWidget()`');
      }

      widgets.forEach(function (widget) {
        if (!_this3.widgets.includes(widget) || typeof widget.dispose !== 'function') {
          throw new Error('The widget you tried to remove does not implement the dispose method, therefore it is not possible to remove this widget');
        }

        _this3.widgets = _this3.widgets.filter(function (w) {
          return w !== widget;
        });

        var nextState = widget.dispose({
          helper: _this3.helper,
          state: _this3.helper.getState()
        });

        // re-compute remaining widgets to the state
        // in a case two widgets were using the same configuration but we removed one
        if (nextState) {
          // We dont want to re-add URlSync `getConfiguration` widget
          // it can throw errors since it may re-add SearchParameters about something unmounted
          _this3.searchParameters = _this3.widgets.filter(function (w) {
            return w.constructor.name !== 'URLSync';
          }).reduce(enhanceConfiguration({}), _extends({}, nextState));

          _this3.helper.setState(_this3.searchParameters);
        }
      });

      // no need to retrigger a search if we don't have any widgets left
      if (this.widgets.length > 0) {
        this.helper.search();
      }
    }

    /**
     * The start methods ends the initialization of InstantSearch.js and triggers the
     * first search. This method should be called after all widgets have been added
     * to the instance of InstantSearch.js. InstantSearch.js also supports adding and removing
     * widgets after the start as an **EXPERIMENTAL** feature.
     *
     * @return {undefined} Does not return anything
     */

  }, {
    key: 'start',
    value: function start() {
      var _this4 = this;

      if (!this.widgets) throw new Error('No widgets were added to instantsearch.js');

      if (this.started) throw new Error('start() has been already called once');

      var searchParametersFromUrl = void 0;

      if (this.urlSync) {
        var syncWidget = (0, _urlSync2.default)(this.urlSync);
        this._createURL = syncWidget.createURL.bind(syncWidget);
        this._createAbsoluteURL = function (relative) {
          return _this4._createURL(relative, { absolute: true });
        };
        this._onHistoryChange = syncWidget.onHistoryChange.bind(syncWidget);
        this.widgets.push(syncWidget);
        searchParametersFromUrl = syncWidget.searchParametersFromUrl;
      } else {
        this._createURL = defaultCreateURL;
        this._createAbsoluteURL = defaultCreateURL;
        this._onHistoryChange = function () {};
      }

      this.searchParameters = this.widgets.reduce(enhanceConfiguration(searchParametersFromUrl), this.searchParameters);

      var helper = (0, _algoliasearchHelper2.default)(this.client, this.searchParameters.index || this.indexName, this.searchParameters);

      if (this._searchFunction) {
        this._mainHelperSearch = helper.search.bind(helper);
        helper.search = function () {
          var helperSearchFunction = (0, _algoliasearchHelper2.default)({
            addAlgoliaAgent: function addAlgoliaAgent() {},
            search: function search() {}
          }, helper.state.index, helper.state);
          helperSearchFunction.once('search', function (state) {
            helper.overrideStateWithoutTriggeringChangeEvent(state);
            _this4._mainHelperSearch();
          });
          _this4._searchFunction(helperSearchFunction);
        };
      }

      this.helper = helper;
      this._init(helper.state, this.helper);
      this.helper.on('result', this._render.bind(this, this.helper));

      this._searchStalledTimer = null;
      this._isSearchStalled = true;

      this.helper.search();

      this.helper.on('search', function () {
        if (!_this4._isSearchStalled && !_this4._searchStalledTimer) {
          _this4._searchStalledTimer = setTimeout(function () {
            _this4._isSearchStalled = true;
            _this4._render(_this4.helper, _this4.helper.lastResults, _this4.helper.lastResults._state);
          }, _this4._stalledSearchDelay);
        }
      });

      // track we started the search if we add more widgets,
      // to init them directly after add
      this.started = true;
    }

    /**
     * Remove all widgets without triggering a search afterwards. This is an **EXPERIMENTAL** feature,
     * if you find an issue with it, please
     * [open an issue](https://github.com/algolia/instantsearch.js/issues/new?title=Problem%20with%20dispose).
     * @return {undefined} This method does not return anything
     */

  }, {
    key: 'dispose',
    value: function dispose() {
      this.removeWidgets(this.widgets);
    }
  }, {
    key: 'createURL',
    value: function createURL(params) {
      if (!this._createURL) {
        throw new Error('You need to call start() before calling createURL()');
      }
      return this._createURL(this.helper.state.setQueryParameters(params));
    }
  }, {
    key: '_render',
    value: function _render(helper, results, state) {
      var _this5 = this;

      if (!this.helper.hasPendingRequests()) {
        clearTimeout(this._searchStalledTimer);
        this._searchStalledTimer = null;
        this._isSearchStalled = false;
      }

      (0, _forEach2.default)(this.widgets, function (widget) {
        if (!widget.render) {
          return;
        }
        widget.render({
          templatesConfig: _this5.templatesConfig,
          results: results,
          state: state,
          helper: helper,
          createURL: _this5._createAbsoluteURL,
          instantSearchInstance: _this5,
          searchMetadata: {
            isSearchStalled: _this5._isSearchStalled
          }
        });
      });

      /**
       * Render is triggered when the rendering of the widgets has been completed
       * after a search.
       * @event IntantSearch#render
       */
      this.emit('render');
    }
  }, {
    key: '_init',
    value: function _init(state, helper) {
      var _this6 = this;

      (0, _forEach2.default)(this.widgets, function (widget) {
        if (widget.init) {
          widget.init({
            state: state,
            helper: helper,
            templatesConfig: _this6.templatesConfig,
            createURL: _this6._createAbsoluteURL,
            onHistoryChange: _this6._onHistoryChange,
            instantSearchInstance: _this6
          });
        }
      });
    }
  }]);

  return InstantSearch;
}(_events.EventEmitter);

function enhanceConfiguration(searchParametersFromUrl) {
  return function (configuration, widgetDefinition) {
    if (!widgetDefinition.getConfiguration) return configuration;

    // Get the relevant partial configuration asked by the widget
    var partialConfiguration = widgetDefinition.getConfiguration(configuration, searchParametersFromUrl);

    var customizer = function customizer(a, b) {
      // always create a unified array for facets refinements
      if (Array.isArray(a)) {
        return (0, _union2.default)(a, b);
      }

      // avoid mutating objects
      if ((0, _isPlainObject2.default)(a)) {
        return (0, _mergeWith2.default)({}, a, b, customizer);
      }

      return undefined;
    };

    return (0, _mergeWith2.default)({}, configuration, partialConfiguration, customizer);
  };
}

exports.default = InstantSearch;