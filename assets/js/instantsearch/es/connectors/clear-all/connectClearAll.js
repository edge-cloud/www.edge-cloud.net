import { checkRendering, getRefinements, clearRefinementsFromState, clearRefinementsAndSearch } from '../../lib/utils.js';

var usage = 'Usage:\nvar customClearAll = connectClearAll(function render(params, isFirstRendering) {\n  // params = {\n  //   refine,\n  //   hasRefinements,\n  //   createURL,\n  //   instantSearchInstance,\n  //   widgetParams,\n  // }\n});\nsearch.addWidget(\n  customClearAll({\n    [ excludeAttributes = [] ],\n    [ clearsQuery = false ]\n  })\n);\nFull documentation available at https://community.algolia.com/instantsearch.js/connectors/connectClearAll.html\n';

var refine = function refine(_ref) {
  var helper = _ref.helper,
      clearAttributes = _ref.clearAttributes,
      hasRefinements = _ref.hasRefinements,
      clearsQuery = _ref.clearsQuery;
  return function () {
    if (hasRefinements) {
      clearRefinementsAndSearch(helper, clearAttributes, clearsQuery);
    }
  };
};

/**
 * @typedef {Object} CustomClearAllWidgetOptions
 * @property {string[]} [excludeAttributes = []] Every attributes that should not be removed when calling `refine()`.
 * @property {boolean} [clearsQuery = false] If `true`, `refine()` also clears the current search query.
 */

/**
 * @typedef {Object} ClearAllRenderingOptions
 * @property {function} refine Triggers the clear of all the currently refined values.
 * @property {boolean} hasRefinements Indicates if search state is refined.
 * @property {function} createURL Creates a url for the next state when refinements are cleared.
 * @property {Object} widgetParams All original `CustomClearAllWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **ClearAll** connector provides the logic to build a custom widget that will give the user
 * the ability to reset the search state.
 *
 * This connector provides a `refine` function to remove the current refined facets.
 *
 * The behaviour of this function can be changed with widget options. If `clearsQuery`
 * is set to `true`, `refine` will also clear the query and `excludeAttributes` can
 * prevent certain attributes from being cleared.
 *
 * @type {Connector}
 * @param {function(ClearAllRenderingOptions, boolean)} renderFn Rendering function for the custom **ClearAll** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomClearAllWidgetOptions)} Re-usable widget factory for a custom **ClearAll** widget.
 * @example
 * // custom `renderFn` to render the custom ClearAll widget
 * function renderFn(ClearAllRenderingOptions, isFirstRendering) {
 *   var containerNode = ClearAllRenderingOptions.widgetParams.containerNode;
 *   if (isFirstRendering) {
 *     var markup = $('<button id="custom-clear-all">Clear All</button>');
 *     containerNode.append(markup);
 *
 *     markup.on('click', function(event) {
 *       event.preventDefault();
 *       ClearAllRenderingOptions.refine();
 *     })
 *   }
 *
 *   var clearAllCTA = containerNode.find('#custom-clear-all');
 *   clearAllCTA.attr('disabled', !ClearAllRenderingOptions.hasRefinements)
 * };
 *
 * // connect `renderFn` to ClearAll logic
 * var customClearAllWidget = instantsearch.connectors.connectClearAll(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customClearAllWidget({
 *     containerNode: $('#custom-clear-all-container'),
 *   })
 * );
 */
export default function connectClearAll(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return function () {
    var widgetParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _widgetParams$exclude = widgetParams.excludeAttributes,
        excludeAttributes = _widgetParams$exclude === undefined ? [] : _widgetParams$exclude,
        _widgetParams$clearsQ = widgetParams.clearsQuery,
        clearsQuery = _widgetParams$clearsQ === undefined ? false : _widgetParams$clearsQ;


    return {
      // Provide the same function to the `renderFn` so that way the user
      // has to only bind it once when `isFirstRendering` for instance
      _refine: function _refine() {},
      _cachedRefine: function _cachedRefine() {
        this._refine();
      },
      init: function init(_ref2) {
        var helper = _ref2.helper,
            instantSearchInstance = _ref2.instantSearchInstance,
            createURL = _ref2.createURL;

        this._cachedRefine = this._cachedRefine.bind(this);

        var clearAttributes = getRefinements({}, helper.state).map(function (one) {
          return one.attributeName;
        }).filter(function (one) {
          return excludeAttributes.indexOf(one) === -1;
        });

        var hasRefinements = clearsQuery ? clearAttributes.length !== 0 || helper.state.query !== '' : clearAttributes.length !== 0;
        var preparedCreateURL = function preparedCreateURL() {
          return createURL(clearRefinementsFromState(helper.state, [], clearsQuery));
        };

        this._refine = refine({
          helper: helper,
          clearAttributes: clearAttributes,
          hasRefinements: hasRefinements,
          clearsQuery: clearsQuery
        });

        renderFn({
          refine: this._cachedRefine,
          hasRefinements: hasRefinements,
          createURL: preparedCreateURL,
          instantSearchInstance: instantSearchInstance,
          widgetParams: widgetParams
        }, true);
      },
      render: function render(_ref3) {
        var results = _ref3.results,
            state = _ref3.state,
            createURL = _ref3.createURL,
            helper = _ref3.helper,
            instantSearchInstance = _ref3.instantSearchInstance;

        var clearAttributes = getRefinements(results, state).map(function (one) {
          return one.attributeName;
        }).filter(function (one) {
          return excludeAttributes.indexOf(one) === -1;
        });

        var hasRefinements = clearsQuery ? clearAttributes.length !== 0 || helper.state.query !== '' : clearAttributes.length !== 0;
        var preparedCreateURL = function preparedCreateURL() {
          return createURL(clearRefinementsFromState(state, [], clearsQuery));
        };

        this._refine = refine({
          helper: helper,
          clearAttributes: clearAttributes,
          hasRefinements: hasRefinements,
          clearsQuery: clearsQuery
        });

        renderFn({
          refine: this._cachedRefine,
          hasRefinements: hasRefinements,
          createURL: preparedCreateURL,
          instantSearchInstance: instantSearchInstance,
          widgetParams: widgetParams
        }, false);
      },
      dispose: function dispose() {
        unmountFn();
      }
    };
  };
}