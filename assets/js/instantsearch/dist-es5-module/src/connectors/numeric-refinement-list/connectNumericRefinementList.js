'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = connectNumericRefinementList;

var _includes = require('lodash/includes');

var _includes2 = _interopRequireDefault(_includes);

var _utils = require('../../lib/utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var usage = 'Usage:\nvar customNumericRefinementList = connectNumericRefinementList(function renderFn(params, isFirstRendering) {\n  // params = {\n  //   createURL,\n  //   items,\n  //   hasNoResults,\n  //   refine,\n  //   instantSearchInstance,\n  //   widgetParams,\n  //  }\n});\nsearch.addWidget(\n  customNumericRefinementList({\n    attributeName,\n    options,\n  })\n);\nFull documentation available at https://community.algolia.com/instantsearch.js/connectors/connectNumericRefinementList.html\n';

/**
 * @typedef {Object} NumericRefinementListOption
 * @property {string} name Name of the option.
 * @property {number} start Lower bound of the option (>=).
 * @property {number} end Higher bound of the option (<=).
 */

/**
 * @typedef {Object} NumericRefinementListItem
 * @property {string} label Name of the option.
 * @property {number} start Lower bound of the option (>=).
 * @property {number} end Higher bound of the option (<=).
 * @property {boolean} isRefined True if the value is selected.
 * @property {string} attributeName The name of the attribute in the records.
 */

/**
 * @typedef {Object} CustomNumericRefinementListWidgetOptions
 * @property {string} attributeName Name of the attribute for filtering.
 * @property {NumericRefinementListOption[]} options List of all the options.
 */

/**
 * @typedef {Object} NumericRefinementListRenderingOptions
 * @property {function(item.value): string} createURL Creates URL's for the next state, the string is the name of the selected option.
 * @property {NumericRefinementListItem[]} items The list of available choices.
 * @property {boolean} hasNoResults `true` if the last search contains no result.
 * @property {function(item.value)} refine Sets the selected value and trigger a new search.
 * @property {Object} widgetParams All original `CustomNumericRefinementListWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **NumericRefinementList** connector provides the logic to build a custom widget that will give the user the ability to choose a range on to refine the search results.
 *
 * It provides a `refine(item)` function to refine on the selected range.
 *
 * **Requirement:** the attribute passed as `attributeName` must be present in "attributes for faceting" on the Algolia dashboard or configured as attributesForFaceting via a set settings call to the Algolia API.
 * @function connectNumericRefinementList
 * @type {Connector}
 * @param {function(NumericRefinementListRenderingOptions, boolean)} renderFn Rendering function for the custom **NumericRefinementList** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomNumericRefinementListWidgetOptions)} Re-usable widget factory for a custom **NumericRefinementList** widget.
 * @example
 * // custom `renderFn` to render the custom NumericRefinementList widget
 * function renderFn(NumericRefinementListRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     NumericRefinementListRenderingOptions.widgetParams.containerNode.html('<ul></ul>');
 *   }
 *
 *   NumericRefinementListRenderingOptions.widgetParams.containerNode
 *     .find('li[data-refine-value]')
 *     .each(function() { $(this).off('click'); });
 *
 *   var list = NumericRefinementListRenderingOptions.items.map(function(item) {
 *     return '<li data-refine-value="' + item.value + '">' +
 *       '<input type="radio"' + (item.isRefined ? ' checked' : '') + '/> ' +
 *       item.label + '</li>';
 *   });
 *
 *   NumericRefinementListRenderingOptions.widgetParams.containerNode.find('ul').html(list);
 *   NumericRefinementListRenderingOptions.widgetParams.containerNode
 *     .find('li[data-refine-value]')
 *     .each(function() {
 *       $(this).on('click', function(event) {
 *         event.preventDefault();
 *         event.stopPropagation();
 *         NumericRefinementListRenderingOptions.refine($(this).data('refine-value'));
 *       });
 *     });
 * }
 *
 * // connect `renderFn` to NumericRefinementList logic
 * var customNumericRefinementList = instantsearch.connectors.connectNumericRefinementList(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customNumericRefinementList({
 *     containerNode: $('#custom-numeric-refinement-container'),
 *     attributeName: 'price',
 *     options: [
 *       {name: 'All'},
 *       {end: 4, name: 'less than 4'},
 *       {start: 4, end: 4, name: '4'},
 *       {start: 5, end: 10, name: 'between 5 and 10'},
 *       {start: 10, name: 'more than 10'},
 *     ],
 *   })
 * );
 */
function connectNumericRefinementList(renderFn, unmountFn) {
  (0, _utils.checkRendering)(renderFn, usage);

  return function () {
    var widgetParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var attributeName = widgetParams.attributeName,
        options = widgetParams.options;


    if (!attributeName || !options) {
      throw new Error(usage);
    }

    return {
      init: function init(_ref) {
        var helper = _ref.helper,
            createURL = _ref.createURL,
            instantSearchInstance = _ref.instantSearchInstance;

        this._refine = function (facetValue) {
          var refinedState = refine(helper.state, attributeName, options, facetValue);
          helper.setState(refinedState).search();
        };

        this._createURL = function (state) {
          return function (facetValue) {
            return createURL(refine(state, attributeName, options, facetValue));
          };
        };
        this._prepareItems = function (state) {
          return options.map(function (_ref2) {
            var start = _ref2.start,
                end = _ref2.end,
                label = _ref2.name;
            return {
              label: label,
              value: window.encodeURI(JSON.stringify({ start: start, end: end })),
              isRefined: isRefined(state, attributeName, { start: start, end: end })
            };
          });
        };

        renderFn({
          createURL: this._createURL(helper.state),
          items: this._prepareItems(helper.state),
          hasNoResults: true,
          refine: this._refine,
          instantSearchInstance: instantSearchInstance,
          widgetParams: widgetParams
        }, true);
      },
      render: function render(_ref3) {
        var results = _ref3.results,
            state = _ref3.state,
            instantSearchInstance = _ref3.instantSearchInstance;

        renderFn({
          createURL: this._createURL(state),
          items: this._prepareItems(state),
          hasNoResults: results.nbHits === 0,
          refine: this._refine,
          instantSearchInstance: instantSearchInstance,
          widgetParams: widgetParams
        }, false);
      },
      dispose: function dispose(_ref4) {
        var state = _ref4.state;

        unmountFn();
        return state.clearRefinements(attributeName);
      }
    };
  };
}

function isRefined(state, attributeName, option) {
  var currentRefinements = state.getNumericRefinements(attributeName);

  if (option.start !== undefined && option.end !== undefined) {
    if (option.start === option.end) {
      return hasNumericRefinement(currentRefinements, '=', option.start);
    }
  }

  if (option.start !== undefined) {
    return hasNumericRefinement(currentRefinements, '>=', option.start);
  }

  if (option.end !== undefined) {
    return hasNumericRefinement(currentRefinements, '<=', option.end);
  }

  if (option.start === undefined && option.end === undefined) {
    return Object.keys(currentRefinements).length === 0;
  }

  return undefined;
}

function refine(state, attributeName, options, facetValue) {
  var resolvedState = state;

  var refinedOption = JSON.parse(window.decodeURI(facetValue));

  var currentRefinements = resolvedState.getNumericRefinements(attributeName);

  if (refinedOption.start === undefined && refinedOption.end === undefined) {
    return resolvedState.clearRefinements(attributeName);
  }

  if (!isRefined(resolvedState, attributeName, refinedOption)) {
    resolvedState = resolvedState.clearRefinements(attributeName);
  }

  if (refinedOption.start !== undefined && refinedOption.end !== undefined) {
    if (refinedOption.start > refinedOption.end) {
      throw new Error('option.start should be > to option.end');
    }

    if (refinedOption.start === refinedOption.end) {
      if (hasNumericRefinement(currentRefinements, '=', refinedOption.start)) {
        resolvedState = resolvedState.removeNumericRefinement(attributeName, '=', refinedOption.start);
      } else {
        resolvedState = resolvedState.addNumericRefinement(attributeName, '=', refinedOption.start);
      }
      return resolvedState;
    }
  }

  if (refinedOption.start !== undefined) {
    if (hasNumericRefinement(currentRefinements, '>=', refinedOption.start)) {
      resolvedState = resolvedState.removeNumericRefinement(attributeName, '>=', refinedOption.start);
    } else {
      resolvedState = resolvedState.addNumericRefinement(attributeName, '>=', refinedOption.start);
    }
  }

  if (refinedOption.end !== undefined) {
    if (hasNumericRefinement(currentRefinements, '<=', refinedOption.end)) {
      resolvedState = resolvedState.removeNumericRefinement(attributeName, '<=', refinedOption.end);
    } else {
      resolvedState = resolvedState.addNumericRefinement(attributeName, '<=', refinedOption.end);
    }
  }

  resolvedState.page = 0;

  return resolvedState;
}

function hasNumericRefinement(currentRefinements, operator, value) {
  var hasOperatorRefinements = currentRefinements[operator] !== undefined;
  var includesValue = (0, _includes2.default)(currentRefinements[operator], value);

  return hasOperatorRefinements && includesValue;
}