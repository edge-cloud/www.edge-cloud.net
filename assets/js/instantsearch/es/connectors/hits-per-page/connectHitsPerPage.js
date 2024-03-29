var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

import some from 'lodash/some';

import { checkRendering } from '../../lib/utils.js';

var usage = 'Usage:\nvar customHitsPerPage = connectHitsPerPage(function render(params, isFirstRendering) {\n  // params = {\n  //   items,\n  //   refine,\n  //   hasNoResults,\n  //   instantSearchInstance,\n  //   widgetParams,\n  // }\n});\nsearch.addWidget(\n  customHitsPerPage({\n    items: [\n      {value: 5, label: \'5 results per page\', default: true},\n      {value: 10, label: \'10 results per page\'},\n      {value: 42, label: \'42 results per page\'},\n    ],\n  })\n);\nFull documentation available at https://community.algolia.com/instantsearch.js/connectors/connectHitsPerPage.html\n';

/**
 * @typedef {Object} HitsPerPageRenderingOptionsItem
 * @property {number} value Number of hits to display per page.
 * @property {string} label Label to display in the option.
 * @property {boolean} isRefined Indicates if it's the current refined value.
 */

/**
* @typedef {Object} HitsPerPageWidgetOptionsItem
* @property {number} value Number of hits to display per page.
* @property {string} label Label to display in the option.
* @property {boolean} default The default hits per page on first search.
*/

/**
 * @typedef {Object} HitsPerPageRenderingOptions
 * @property {HitsPerPageRenderingOptionsItem[]} items Array of objects defining the different values and labels.
 * @property {function(number)} refine Sets the number of hits per page and trigger a search.
 * @property {boolean} hasNoResults `true` if the last search contains no result.
 * @property {Object} widgetParams Original `HitsPerPageWidgetOptions` forwarded to `renderFn`.
 */

/**
 * @typedef {Object} HitsPerPageWidgetOptions
 * @property {HitsPerPageWidgetOptionsItem[]} items Array of objects defining the different values and labels.
 */

/**
 * **HitsPerPage** connector provides the logic to create custom widget that will
 * allow a user to choose to display more or less results from Algolia.
 *
 * This connector provides a `refine()` function to change the hits per page configuration and trigger a new search.
 * @type {Connector}
 * @param {function(HitsPerPageRenderingOptions, boolean)} renderFn Rendering function for the custom **HitsPerPage** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(HitsPerPageWidgetOptions)} Re-usable widget factory for a custom **HitsPerPage** widget.
 * @example
 * // custom `renderFn` to render the custom HitsPerPage widget
 * function renderFn(HitsPerPageRenderingOptions, isFirstRendering) {
 *   var containerNode = HitsPerPageRenderingOptions.widgetParams.containerNode
 *   var items = HitsPerPageRenderingOptions.items
 *   var refine = HitsPerPageRenderingOptions.refine
 *
 *   if (isFirstRendering) {
 *     var markup = '<select></select>';
 *     containerNode.append(markup);
 *   }
 *
 *   const itemsHTML = items.map(({value, label, isRefined}) => `
 *     <option
 *       value="${value}"
 *       ${isRefined ? 'selected' : ''}
 *     >
 *       ${label}
 *     </option>
 *   `);
 *
 *   containerNode
 *     .find('select')
 *     .html(itemsHTML);
 *
 *   containerNode
 *     .find('select')
 *     .off('change')
 *     .on('change', e => { refine(e.target.value); });
 * }
 *
 * // connect `renderFn` to HitsPerPage logic
 * var customHitsPerPage = instantsearch.connectors.connectHitsPerPage(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customHitsPerPage({
 *     containerNode: $('#custom-hits-per-page-container'),
 *     items: [
 *       {value: 6, label: '6 per page', default: true},
 *       {value: 12, label: '12 per page'},
 *       {value: 24, label: '24 per page'},
 *     ],
 *   })
 * );
 */
export default function connectHitsPerPage(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return function () {
    var widgetParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var userItems = widgetParams.items;

    var items = userItems;

    if (!items) {
      throw new Error(usage);
    }

    var defaultValues = items.filter(function (item) {
      return item.default;
    });
    if (defaultValues.length > 1) {
      throw new Error('[Error][hitsPerPageSelector] more than one default value is specified in `items[]`\nThe first one will be picked, you should probably set only one default value');
    }

    return {
      getConfiguration: function getConfiguration() {
        return defaultValues.length > 0 ? { hitsPerPage: defaultValues[0].value } : {};
      },
      init: function init(_ref) {
        var helper = _ref.helper,
            state = _ref.state,
            instantSearchInstance = _ref.instantSearchInstance;

        var isCurrentInOptions = some(items, function (item) {
          return Number(state.hitsPerPage) === Number(item.value);
        });

        if (!isCurrentInOptions) {
          if (state.hitsPerPage === undefined) {
            if (window.console) {
              window.console.warn('[Warning][hitsPerPageSelector] hitsPerPage not defined.\n  You should probably set the value `hitsPerPage`\n  using the searchParameters attribute of the instantsearch constructor.');
            }
          } else if (window.console) {
            window.console.warn('[Warning][hitsPerPageSelector] No item in `items`\n  with `value: hitsPerPage` (hitsPerPage: ' + state.hitsPerPage + ')');
          }

          items = [{ value: undefined, label: '' }].concat(_toConsumableArray(items));
        }

        this.setHitsPerPage = function (value) {
          return helper.setQueryParameter('hitsPerPage', value).search();
        };

        renderFn({
          items: this._transformItems(state),
          refine: this.setHitsPerPage,
          hasNoResults: true,
          widgetParams: widgetParams,
          instantSearchInstance: instantSearchInstance
        }, true);
      },
      render: function render(_ref2) {
        var state = _ref2.state,
            results = _ref2.results,
            instantSearchInstance = _ref2.instantSearchInstance;

        var hasNoResults = results.nbHits === 0;

        renderFn({
          items: this._transformItems(state),
          refine: this.setHitsPerPage,
          hasNoResults: hasNoResults,
          widgetParams: widgetParams,
          instantSearchInstance: instantSearchInstance
        }, false);
      },
      _transformItems: function _transformItems(_ref3) {
        var hitsPerPage = _ref3.hitsPerPage;

        return items.map(function (item) {
          return _extends({}, item, {
            isRefined: Number(item.value) === Number(hitsPerPage)
          });
        });
      },
      dispose: function dispose() {
        unmountFn();
      }
    };
  };
}