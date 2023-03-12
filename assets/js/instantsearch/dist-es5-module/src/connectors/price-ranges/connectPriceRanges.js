'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = connectPriceRanges;

var _utils = require('../../lib/utils.js');

var _generateRanges2 = require('./generate-ranges.js');

var _generateRanges3 = _interopRequireDefault(_generateRanges2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var usage = 'Usage:\nvar customPriceRanges = connectToggle(function render(params, isFirstRendering) {\n  // params = {\n  //   items,\n  //   refine,\n  //   instantSearchInstance,\n  //   widgetParams,\n  // }\n});\nsearch.addWidget(\n  customPriceRanges({\n    attributeName,\n  })\n);\nFull documentation available at https://community.algolia.com/instantsearch.js/connectors/connectPriceRanges.html\n';

/**
 * @typedef {Object} PriceRangesItem
 * @property {number} [from] Lower bound of the price range.
 * @property {number} [to] Higher bound of the price range.
 * @property {string} url The URL for a single item in the price range.
 */

/**
 * @typedef {Object} CustomPriceRangesWidgetOptions
 * @property {string} attributeName Name of the attribute for faceting.
 */

/**
 * @typedef {Object} PriceRangesRenderingOptions
 * @property {PriceRangesItem[]} items The prices ranges to display.
 * @property {function(PriceRangesItem)} refine Selects or unselects a price range and trigger a search.
 * @property {Object} widgetParams All original `CustomPriceRangesWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **PriceRanges** connector provides the logic to build a custom widget that will let
 * the user refine results based on price ranges.
 *
 * @type {Connector}
 * @param {function(PriceRangesRenderingOptions, boolean)} renderFn Rendering function for the custom **PriceRanges** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomPriceRangesWidgetOptions)} Re-usable widget factory for a custom **PriceRanges** widget.
 * @example
 * function getLabel(item) {
 *   var from = item.from;
 *   var to = item.to;
 *
 *   if (to === undefined) return '≥ $' + from;
 *   if (from === undefined) return '≤ $' + to;
 *   return '$' + from + ' - $' + to;
 * }
 *
 * // custom `renderFn` to render the custom PriceRanges widget
 * function renderFn(PriceRangesRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     PriceRangesRenderingOptions.widgetParams.containerNode.html('<ul></ul>');
 *   }
 *
 *   PriceRangesRenderingOptions.widgetParams.containerNode
 *     .find('ul > li')
 *     .each(function() { $(this).off('click'); });
 *
 *   var list = PriceRangesRenderingOptions.items.map(function(item) {
 *     return '<li><a href="' + item.url + '">' + getLabel(item) + '</a></li>';
 *   });
 *
 *   PriceRangesRenderingOptions.widgetParams.containerNode
 *     .find('ul')
 *     .html(list);
 *
 *   PriceRangesRenderingOptions.widgetParams.containerNode
 *     .find('li')
 *     .each(function(index) {
 *       $(this).on('click', function(event) {
 *         event.stopPropagation();
 *         event.preventDefault();
 *
 *         PriceRangesRenderingOptions.refine(
 *           PriceRangesRenderingOptions.items[index]
 *         );
 *       });
 *     });
 * }
 *
 * // connect `renderFn` to PriceRanges logic
 * var customPriceRanges = instantsearch.connectors.connectPriceRanges(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customPriceRanges({
 *     containerNode: $('#custom-price-ranges-container'),
 *     attributeName: 'price',
 *   })
 * );
 */
function connectPriceRanges(renderFn, unmountFn) {
  (0, _utils.checkRendering)(renderFn, usage);

  return function () {
    var widgetParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var attributeName = widgetParams.attributeName;


    if (!attributeName) {
      throw new Error(usage);
    }

    return {
      getConfiguration: function getConfiguration() {
        return { facets: [attributeName] };
      },
      _generateRanges: function _generateRanges(results) {
        var stats = results.getFacetStats(attributeName);
        return (0, _generateRanges3.default)(stats);
      },
      _extractRefinedRange: function _extractRefinedRange(helper) {
        var refinements = helper.getRefinements(attributeName);
        var from = void 0;
        var to = void 0;

        if (refinements.length === 0) {
          return [];
        }

        refinements.forEach(function (v) {
          if (v.operator.indexOf('>') !== -1) {
            from = Math.floor(v.value[0]);
          } else if (v.operator.indexOf('<') !== -1) {
            to = Math.ceil(v.value[0]);
          }
        });
        return [{ from: from, to: to, isRefined: true }];
      },
      _refine: function _refine(helper, _ref) {
        var from = _ref.from,
            to = _ref.to;

        var facetValues = this._extractRefinedRange(helper);

        helper.clearRefinements(attributeName);
        if (facetValues.length === 0 || facetValues[0].from !== from || facetValues[0].to !== to) {
          if (typeof from !== 'undefined') {
            helper.addNumericRefinement(attributeName, '>=', Math.floor(from));
          }
          if (typeof to !== 'undefined') {
            helper.addNumericRefinement(attributeName, '<=', Math.ceil(to));
          }
        }

        helper.search();
      },
      init: function init(_ref2) {
        var _this = this;

        var helper = _ref2.helper,
            instantSearchInstance = _ref2.instantSearchInstance;

        this.refine = function (opts) {
          _this._refine(helper, opts);
        };

        renderFn({
          instantSearchInstance: instantSearchInstance,
          items: [],
          refine: this.refine,
          widgetParams: widgetParams
        }, true);
      },
      render: function render(_ref3) {
        var results = _ref3.results,
            helper = _ref3.helper,
            state = _ref3.state,
            createURL = _ref3.createURL,
            instantSearchInstance = _ref3.instantSearchInstance;

        var facetValues = void 0;

        if (results && results.hits && results.hits.length > 0) {
          facetValues = this._extractRefinedRange(helper);

          if (facetValues.length === 0) {
            facetValues = this._generateRanges(results);
          }
        } else {
          facetValues = [];
        }

        facetValues.map(function (facetValue) {
          var newState = state.clearRefinements(attributeName);
          if (!facetValue.isRefined) {
            if (facetValue.from !== undefined) {
              newState = newState.addNumericRefinement(attributeName, '>=', Math.floor(facetValue.from));
            }
            if (facetValue.to !== undefined) {
              newState = newState.addNumericRefinement(attributeName, '<=', Math.ceil(facetValue.to));
            }
          }
          facetValue.url = createURL(newState);
          return facetValue;
        });

        renderFn({
          items: facetValues,
          refine: this.refine,
          widgetParams: widgetParams,
          instantSearchInstance: instantSearchInstance
        }, false);
      },
      dispose: function dispose(_ref4) {
        var state = _ref4.state;

        unmountFn();

        var nextState = state.removeFacetRefinement(attributeName).removeFacet(attributeName);

        return nextState;
      }
    };
  };
}