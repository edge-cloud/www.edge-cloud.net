'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

require('../shams/Object.freeze.js');

require('../shims/Object.getPrototypeOf.js');

var _toFactory = require('to-factory');

var _toFactory2 = _interopRequireDefault(_toFactory);

var _algoliasearchHelper = require('algoliasearch-helper');

var _algoliasearchHelper2 = _interopRequireDefault(_algoliasearchHelper);

var _InstantSearch = require('./InstantSearch.js');

var _InstantSearch2 = _interopRequireDefault(_InstantSearch);

var _version = require('./version.js');

var _version2 = _interopRequireDefault(_version);

var _index = require('../connectors/index.js');

var connectors = _interopRequireWildcard(_index);

var _index2 = require('../widgets/index.js');

var widgets = _interopRequireWildcard(_index2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @typedef {Object} UrlSyncOptions
 * @property {Object} [mapping] Object used to define replacement query
 * parameter to use in place of another. Keys are current query parameters
 * and value the new value, e.g. `{ q: 'query' }`.
 * @property {number} [threshold] Idle time in ms after which a new
 * state is created in the browser history. The default value is 700. The url is always updated at each keystroke
 * but we only create a "previous search state" (activated when click on back button) every 700ms of idle time.
 * @property {string[]} [trackedParameters] Parameters that will
 * be synchronized in the URL. Default value is `['query', 'attribute:*',
 * 'index', 'page', 'hitsPerPage']`. `attribute:*` means all the faceting attributes will be tracked. You
 * can track only some of them by using [..., 'attribute:color', 'attribute:categories']. All other possible
 * values are all the [attributes of the Helper SearchParameters](https://community.algolia.com/algoliasearch-helper-js/reference.html#searchparameters).
 * @property {boolean} [useHash] If set to true, the url will be
 * hash based. Otherwise, it'll use the query parameters using the modern
 * history API.
 * @property {function} [getHistoryState] Pass this function to override the
 * default history API state we set to `null`. For example this could be used to force passing
 * {turbolinks: true} to the history API every time we update it.
 */

/**
 * @typedef {Object} InstantSearchOptions
 * @property {string} appId The Algolia application ID
 * @property {string} apiKey The Algolia search-only API key
 * @property {string} indexName The name of the main index
 * @property {string} [numberLocale] The locale used to display numbers. This will be passed
 * to [`Number.prototype.toLocaleString()`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString)
 * @property {function} [searchFunction] A hook that will be called each time a search needs to be done, with the
 * helper as a parameter. It's your responsibility to call helper.search(). This option allows you to avoid doing
 * searches at page load for example.
 * @property  {function} [createAlgoliaClient] Allows you to provide your own algolia client instead of
 * the one instantiated internally by instantsearch.js. Useful in situations where you need
 * to setup complex mechanism on the client or if you need to share it easily.
 * Usage:
 * ```javascript
 * instantsearch({
 *   // other parameters
 *   createAlgoliaClient: function(algoliasearch, appId, apiKey) {
 *     return anyCustomClient;
 *   }
 * });
 * ```
 * We forward `algoliasearch` which is the original algoliasearch module imported inside instantsearch.js
 * @property {object} [searchParameters] Additional parameters to pass to
 * the Algolia API.
 * [Full documentation](https://community.algolia.com/algoliasearch-helper-js/reference.html#searchparameters)
 * @property {boolean|UrlSyncOptions} [urlSync] Url synchronization configuration.
 * Setting to `true` will synchronize the needed search parameters with the browser url.
 * @property {number} [stalledSearchDelay=200] Time before a search is considered stalled.
 */

/**
 * InstantSearch is the main component of InstantSearch.js. This object
 * manages the widget and let you add new ones.
 *
 * Three parameters are required to get you started with instantsearch.js:
 *  - `appId`: your algolia application id
 *  - `apiKey`: the search key associated with your application
 *  - `indexName`: the main index that you will use for your new search UI
 *
 * Those parameters can be found in your [Algolia dashboard](https://www.algolia.com/api-keys).
 * If you want to get up and running quickly with InstantSearch.js, have a
 * look at the [getting started](getting-started.html).
 *
 * @function instantsearch
 * @param {InstantSearchOptions} $0 The options
 * @return {InstantSearch} the instantsearch instance
 */
/** @module module:instantsearch */
/**
 * @external SearchParameters
 * @see https://community.algolia.com/algoliasearch-helper-js/reference.html#searchparameters
 */
// required for browsers not supporting Object.freeze (helper requirement)
var instantsearch = (0, _toFactory2.default)(_InstantSearch2.default);

// required for IE <= 10 since move to babel6


instantsearch.createQueryString = _algoliasearchHelper2.default.url.getQueryStringFromState;
instantsearch.connectors = connectors;
instantsearch.widgets = widgets;
instantsearch.version = _version2.default;

exports.default = instantsearch;