var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import find from 'lodash/find';
import isEqual from 'lodash/isEqual';

import { checkRendering } from '../../lib/utils.js';

var usage = 'Usage:\nvar customHierarchicalMenu = connectHierarchicalMenu(function renderFn(params, isFirstRendering) {\n  // params = {\n  //   createURL,\n  //   items,\n  //   refine,\n  //   instantSearchInstance,\n  //   widgetParams,\n  // }\n});\nsearch.addWidget(\n  customHierarchicalMenu({\n    attributes,\n    [ separator = \' > \' ],\n    [ rootPath = null ],\n    [ showParentLevel = true ],\n    [ limit = 10 ],\n    [ sortBy = [\'name:asc\'] ],\n  })\n);\nFull documentation available at https://community.algolia.com/instantsearch.js/connectors/connectHierarchicalMenu.html\n';

/**
 * @typedef {Object} HierarchicalMenuItem
 * @property {string} value Value of the menu item.
 * @property {string} label Human-readable value of the menu item.
 * @property {number} count Number of matched results after refinement is applied.
 * @property {isRefined} boolean Indicates if the refinement is applied.
 * @property {Object} [data = undefined] n+1 level of items, same structure HierarchicalMenuItem (default: `undefined`).
 */

/**
 * @typedef {Object} CustomHierarchicalMenuWidgetOptions
 * @property {string[]} attributes Attributes to use to generate the hierarchy of the menu.
 * @property {string} [separator = '>'] Separator used in the attributes to separate level values.
 * @property {string} [rootPath = null] Prefix path to use if the first level is not the root level.
 * @property {boolean} [showParentLevel=false] Show the siblings of the selected parent levels of the current refined value. This
 * does not impact the root level.
 * @property {number} [limit = 10] Max number of value to display.
 * @property  {string[]|function} [sortBy = ['name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 */

/**
 * @typedef {Object} HierarchicalMenuRenderingOptions
 * @property {function(item.value): string} createURL Creates an url for the next state for a clicked item.
 * @property {HierarchicalMenuItem[]} items Values to be rendered.
 * @property {function(item.value)} refine Sets the path of the hierarchical filter and triggers a new search.
 * @property {Object} widgetParams All original `CustomHierarchicalMenuWidgetOptions` forwarded to the `renderFn`.
 */

/**
  * **HierarchicalMenu** connector provides the logic to build a custom widget
  * that will give the user the ability to explore facets in a tree-like structure.
  *
  * This is commonly used for multi-level categorization of products on e-commerce
  * websites. From a UX point of view, we suggest not displaying more than two
  * levels deep.
  *
  * There's a complete example available on how to write a custom **HierarchicalMenu**:
  *  [hierarchicalMenu.js](https://github.com/algolia/instantsearch.js/blob/develop/dev/app/custom-widgets/jquery/hierarchicalMenu.js)
  * @type {Connector}
  * @param {function(HierarchicalMenuRenderingOptions)} renderFn Rendering function for the custom **HierarchicalMenu** widget.
  * @param {function} unmountFn Unmount function called when the widget is disposed.
  * @return {function(CustomHierarchicalMenuWidgetOptions)} Re-usable widget factory for a custom **HierarchicalMenu** widget.
  */
export default function connectHierarchicalMenu(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return function () {
    var widgetParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var attributes = widgetParams.attributes,
        _widgetParams$separat = widgetParams.separator,
        separator = _widgetParams$separat === undefined ? ' > ' : _widgetParams$separat,
        _widgetParams$rootPat = widgetParams.rootPath,
        rootPath = _widgetParams$rootPat === undefined ? null : _widgetParams$rootPat,
        _widgetParams$showPar = widgetParams.showParentLevel,
        showParentLevel = _widgetParams$showPar === undefined ? true : _widgetParams$showPar,
        _widgetParams$limit = widgetParams.limit,
        limit = _widgetParams$limit === undefined ? 10 : _widgetParams$limit,
        _widgetParams$sortBy = widgetParams.sortBy,
        sortBy = _widgetParams$sortBy === undefined ? ['name:asc'] : _widgetParams$sortBy;


    if (!attributes || !attributes.length) {
      throw new Error(usage);
    }

    // we need to provide a hierarchicalFacet name for the search state
    // so that we can always map $hierarchicalFacetName => real attributes
    // we use the first attribute name

    var _attributes = _slicedToArray(attributes, 1),
        hierarchicalFacetName = _attributes[0];

    return {
      getConfiguration: function getConfiguration(currentConfiguration) {
        if (currentConfiguration.hierarchicalFacets) {
          var isFacetSet = find(currentConfiguration.hierarchicalFacets, function (_ref) {
            var name = _ref.name;
            return name === hierarchicalFacetName;
          });
          if (isFacetSet && !(isEqual(isFacetSet.attributes, attributes) && isFacetSet.separator === separator)) {
            // eslint-disable-next-line no-console
            console.warn('using Breadcrumb & HierarchicalMenu on the same facet with different options');
            return {};
          }
        }

        return {
          hierarchicalFacets: [{
            name: hierarchicalFacetName,
            attributes: attributes,
            separator: separator,
            rootPath: rootPath,
            showParentLevel: showParentLevel
          }],
          maxValuesPerFacet: currentConfiguration.maxValuesPerFacet !== undefined ? Math.max(currentConfiguration.maxValuesPerFacet, limit) : limit
        };
      },

      init: function init(_ref2) {
        var helper = _ref2.helper,
            createURL = _ref2.createURL,
            instantSearchInstance = _ref2.instantSearchInstance;

        this._refine = function (facetValue) {
          helper.toggleRefinement(hierarchicalFacetName, facetValue).search();
        };

        // Bind createURL to this specific attribute
        function _createURL(facetValue) {
          return createURL(helper.state.toggleRefinement(hierarchicalFacetName, facetValue));
        }

        renderFn({
          createURL: _createURL,
          items: [],
          refine: this._refine,
          instantSearchInstance: instantSearchInstance,
          widgetParams: widgetParams
        }, true);
      },
      _prepareFacetValues: function _prepareFacetValues(facetValues, state) {
        var _this = this;

        return facetValues.slice(0, limit).map(function (_ref3) {
          var label = _ref3.name,
              value = _ref3.path,
              subValue = _objectWithoutProperties(_ref3, ['name', 'path']);

          if (Array.isArray(subValue.data)) {
            subValue.data = _this._prepareFacetValues(subValue.data, state);
          }
          return _extends({}, subValue, { label: label, value: value });
        });
      },
      render: function render(_ref4) {
        var results = _ref4.results,
            state = _ref4.state,
            createURL = _ref4.createURL,
            instantSearchInstance = _ref4.instantSearchInstance;

        var items = this._prepareFacetValues(results.getFacetValues(hierarchicalFacetName, { sortBy: sortBy }).data || [], state);

        // Bind createURL to this specific attribute
        function _createURL(facetValue) {
          return createURL(state.toggleRefinement(hierarchicalFacetName, facetValue));
        }

        renderFn({
          createURL: _createURL,
          items: items,
          refine: this._refine,
          instantSearchInstance: instantSearchInstance,
          widgetParams: widgetParams
        }, false);
      },
      dispose: function dispose(_ref5) {
        var state = _ref5.state;

        // unmount widget from DOM
        unmountFn();

        // compute nextState for the search
        var nextState = state;

        if (state.isHierarchicalFacetRefined(hierarchicalFacetName)) {
          nextState = state.removeHierarchicalFacetRefinement(hierarchicalFacetName);
        }

        nextState = nextState.removeHierarchicalFacet(hierarchicalFacetName);

        if (nextState.maxValuesPerFacet === limit) {
          nextState.setQueryParameters('maxValuesPerFacet', undefined);
        }

        return nextState;
      }
    };
  };
}