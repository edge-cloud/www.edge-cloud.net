'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = connectMenu;

var _utils = require('../../lib/utils.js');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var usage = 'Usage:\nvar customMenu = connectMenu(function render(params, isFirstRendering) {\n  // params = {\n  //   items,\n  //   createURL,\n  //   refine,\n  //   instantSearchInstance,\n  //   canRefine,\n  //   widgetParams,\n  //   isShowingMore,\n  //   toggleShowMore\n  // }\n});\nsearch.addWidget(\n  customMenu({\n    attributeName,\n    [ limit ],\n    [ showMoreLimit ]\n    [ sortBy = [\'name:asc\'] ]\n  })\n);\nFull documentation available at https://community.algolia.com/instantsearch.js/connectors/connectMenu.html\n';

/**
 * @typedef {Object} MenuItem
 * @property {string} value The value of the menu item.
 * @property {string} label Human-readable value of the menu item.
 * @property {number} count Number of results matched after refinement is applied.
 * @property {isRefined} boolean Indicates if the refinement is applied.
 */

/**
 * @typedef {Object} CustomMenuWidgetOptions
 * @property {string} attributeName Name of the attribute for faceting (eg. "free_shipping").
 * @property {number} [limit = 10] How many facets values to retrieve.
 * @property {number} [showMoreLimit = undefined] How many facets values to retrieve when `toggleShowMore` is called, this value is meant to be greater than `limit` option.
 * @property {string[]|function} [sortBy = ['name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 */

/**
 * @typedef {Object} MenuRenderingOptions
 * @property {MenuItem[]} items The elements that can be refined for the current search results.
 * @property {function(item.value): string} createURL Creates the URL for a single item name in the list.
 * @property {function(item.value)} refine Filter the search to item value.
 * @property {boolean} canRefine True if refinement can be applied.
 * @property {Object} widgetParams All original `CustomMenuWidgetOptions` forwarded to the `renderFn`.
 * @property {boolean} isShowingMore True if the menu is displaying all the menu items.
 * @property {function} toggleShowMore Toggles the number of values displayed between `limit` and `showMore.limit`.
 * @property {boolean} canToggleShowMore `true` if the toggleShowMore button can be activated (enough items to display more or
 * already displaying more than `limit` items)
 */

/**
  * **Menu** connector provides the logic to build a widget that will give the user the ability to choose a single value for a specific facet. The typical usage of menu is for navigation in categories.
  *
  * This connector provides a `toggleShowMore()` function to display more or less items and a `refine()`
  * function to select an item. While selecting a new element, the `refine` will also unselect the
  * one that is currently selected.
  *
 * **Requirement:** the attribute passed as `attributeName` must be present in "attributes for faceting" on the Algolia dashboard or configured as attributesForFaceting via a set settings call to the Algolia API.
  * @type {Connector}
  * @param {function(MenuRenderingOptions, boolean)} renderFn Rendering function for the custom **Menu** widget. widget.
  * @param {function} unmountFn Unmount function called when the widget is disposed.
  * @return {function(CustomMenuWidgetOptions)} Re-usable widget factory for a custom **Menu** widget.
  * @example
  * // custom `renderFn` to render the custom Menu widget
  * function renderFn(MenuRenderingOptions, isFirstRendering) {
  *   if (isFirstRendering) {
  *     MenuRenderingOptions.widgetParams.containerNode
  *       .html('<select></select');
  *
  *     MenuRenderingOptions.widgetParams.containerNode
  *       .find('select')
  *       .on('change', function(event) {
  *         MenuRenderingOptions.refine(event.target.value);
  *       });
  *   }
  *
  *   var options = MenuRenderingOptions.items.map(function(item) {
  *     return item.isRefined
  *       ? '<option value="' + item.value + '" selected>' + item.label + '</option>'
  *       : '<option value="' + item.value + '">' + item.label + '</option>';
  *   });
  *
  *   MenuRenderingOptions.widgetParams.containerNode
  *     .find('select')
  *     .html(options);
  * }
  *
  * // connect `renderFn` to Menu logic
  * var customMenu = instantsearch.connectors.connectMenu(renderFn);
  *
  * // mount widget on the page
  * search.addWidget(
  *   customMenu({
  *     containerNode: $('#custom-menu-container'),
  *     attributeName: 'categories',
  *     limit: 10,
  *   })
  * );
  */
function connectMenu(renderFn, unmountFn) {
  (0, _utils.checkRendering)(renderFn, usage);

  return function () {
    var widgetParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var attributeName = widgetParams.attributeName,
        _widgetParams$limit = widgetParams.limit,
        limit = _widgetParams$limit === undefined ? 10 : _widgetParams$limit,
        _widgetParams$sortBy = widgetParams.sortBy,
        sortBy = _widgetParams$sortBy === undefined ? ['name:asc'] : _widgetParams$sortBy,
        showMoreLimit = widgetParams.showMoreLimit;


    if (!attributeName || !isNaN(showMoreLimit) && showMoreLimit < limit) {
      throw new Error(usage);
    }

    return {
      isShowingMore: false,

      // Provide the same function to the `renderFn` so that way the user
      // has to only bind it once when `isFirstRendering` for instance
      toggleShowMore: function toggleShowMore() {},
      cachedToggleShowMore: function cachedToggleShowMore() {
        this.toggleShowMore();
      },
      createToggleShowMore: function createToggleShowMore(_ref) {
        var _this = this;

        var results = _ref.results,
            instantSearchInstance = _ref.instantSearchInstance;

        return function () {
          _this.isShowingMore = !_this.isShowingMore;
          _this.render({ results: results, instantSearchInstance: instantSearchInstance });
        };
      },
      getLimit: function getLimit() {
        return this.isShowingMore ? showMoreLimit : limit;
      },
      refine: function refine(helper) {
        return function (facetValue) {
          var _helper$getHierarchic = helper.getHierarchicalFacetBreadcrumb(attributeName),
              _helper$getHierarchic2 = _slicedToArray(_helper$getHierarchic, 1),
              refinedItem = _helper$getHierarchic2[0];

          helper.toggleRefinement(attributeName, facetValue ? facetValue : refinedItem).search();
        };
      },
      getConfiguration: function getConfiguration(configuration) {
        var widgetConfiguration = {
          hierarchicalFacets: [{
            name: attributeName,
            attributes: [attributeName]
          }]
        };

        var currentMaxValuesPerFacet = configuration.maxValuesPerFacet || 0;
        widgetConfiguration.maxValuesPerFacet = Math.max(currentMaxValuesPerFacet, showMoreLimit || limit);

        return widgetConfiguration;
      },
      init: function init(_ref2) {
        var helper = _ref2.helper,
            createURL = _ref2.createURL,
            instantSearchInstance = _ref2.instantSearchInstance;

        this.cachedToggleShowMore = this.cachedToggleShowMore.bind(this);

        this._createURL = function (facetValue) {
          return createURL(helper.state.toggleRefinement(attributeName, facetValue));
        };

        this._refine = this.refine(helper);

        renderFn({
          items: [],
          createURL: this._createURL,
          refine: this._refine,
          instantSearchInstance: instantSearchInstance,
          canRefine: false,
          widgetParams: widgetParams,
          isShowingMore: this.isShowingMore,
          toggleShowMore: this.cachedToggleShowMore,
          canToggleShowMore: false
        }, true);
      },
      render: function render(_ref3) {
        var results = _ref3.results,
            instantSearchInstance = _ref3.instantSearchInstance;

        var facetItems = results.getFacetValues(attributeName, { sortBy: sortBy }).data || [];
        var items = facetItems.slice(0, this.getLimit()).map(function (_ref4) {
          var label = _ref4.name,
              value = _ref4.path,
              item = _objectWithoutProperties(_ref4, ['name', 'path']);

          return _extends({}, item, {
            label: label,
            value: value
          });
        });

        this.toggleShowMore = this.createToggleShowMore({
          results: results,
          instantSearchInstance: instantSearchInstance
        });

        renderFn({
          items: items,
          createURL: this._createURL,
          refine: this._refine,
          instantSearchInstance: instantSearchInstance,
          canRefine: items.length > 0,
          widgetParams: widgetParams,
          isShowingMore: this.isShowingMore,
          toggleShowMore: this.cachedToggleShowMore,
          canToggleShowMore: this.isShowingMore || facetItems.length > this.getLimit()
        }, false);
      },
      dispose: function dispose(_ref5) {
        var state = _ref5.state;

        unmountFn();

        var nextState = state;

        if (state.isHierarchicalFacetRefined(attributeName)) {
          nextState = state.removeHierarchicalFacetRefinement(attributeName);
        }

        nextState = nextState.removeHierarchicalFacet(attributeName);

        if (nextState.maxValuesPerFacet === limit || showMoreLimit && nextState.maxValuesPerFacet === showMoreLimit) {
          nextState.setQueryParameters('maxValuesPerFacet', undefined);
        }

        return nextState;
      }
    };
  };
}