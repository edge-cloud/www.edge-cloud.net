'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = connectBreadcrumb;

var _find = require('lodash/find');

var _find2 = _interopRequireDefault(_find);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _utils = require('../../lib/utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var usage = 'Usage:\nvar customBreadcrumb = connectBreadcrumb(function renderFn(params, isFirstRendering) {\n  // params = {\n  //   createURL,\n  //   items,\n  //   refine,\n  //   instantSearchInstance,\n  //   widgetParams,\n  // }\n});\nsearch.addWidget(\n  customBreadcrumb({\n    attributes,\n    [ rootPath = null ],\n  })\n);\nFull documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectBreadcrumb.html\n';

/**
 * @typedef {Object} CustomBreadcrumbItem
 * @property {string} name Name of the category or subcategory.
 * @property {string} value Value of breadcrumb item.
 */

/**
 * @typedef {Object} CustomBreadcrumbWidgetOptions
 * @property {string[]} attributes Attributes to use to generate the hierarchy of the breadcrumb.
 * @property {string} [rootPath = null] Prefix path to use if the first level is not the root level.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 */

/**
 * @typedef {Object} BreadcrumbRenderingOptions
 * @property {function(item.value): string} createURL Creates an url for the next state for a clicked item. The special value `null` is used for the `Home` (or root) item of the breadcrumb and will return an empty array.
 * @property {BreadcrumbItem[]} items Values to be rendered.
 * @property {function(item.value)} refine Sets the path of the hierarchical filter and triggers a new search.
 * @property {Object} widgetParams All original `CustomBreadcrumbWidgetOptions` forwarded to the `renderFn`.
 */

/**
  * **Breadcrumb** connector provides the logic to build a custom widget
  * that will give the user the ability to see the current path in a hierarchical facet.
  *
  * This is commonly used in websites that have a large amount of content organized in a hierarchical manner (usually e-commerce websites).
  * @type {Connector}
  * @param {function(BreadcrumbRenderingOptions, boolean)} renderFn Rendering function for the custom **Breadcrumb* widget.
  * @return {function(CustomBreadcrumbWidgetOptions)} Re-usable widget factory for a custom **Breadcrumb** widget.
  */
function connectBreadcrumb(renderFn) {
  (0, _utils.checkRendering)(renderFn, usage);
  return function () {
    var widgetParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var attributes = widgetParams.attributes,
        _widgetParams$separat = widgetParams.separator,
        separator = _widgetParams$separat === undefined ? ' > ' : _widgetParams$separat,
        _widgetParams$rootPat = widgetParams.rootPath,
        rootPath = _widgetParams$rootPat === undefined ? null : _widgetParams$rootPat;

    var _attributes = _slicedToArray(attributes, 1),
        hierarchicalFacetName = _attributes[0];

    if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
      throw new Error(usage);
    }

    return {
      getConfiguration: function getConfiguration(currentConfiguration) {
        if (currentConfiguration.hierarchicalFacets) {
          var isFacetSet = (0, _find2.default)(currentConfiguration.hierarchicalFacets, function (_ref) {
            var name = _ref.name;
            return name === hierarchicalFacetName;
          });
          if (isFacetSet) {
            if (!(0, _isEqual2.default)(isFacetSet.attributes, attributes) || isFacetSet.separator !== separator) {
              // eslint-disable-next-line no-console
              console.warn('Using Breadcrumb & HierarchicalMenu on the same facet with different options. Adding that one will override the configuration of the HierarchicalMenu. Check your options.');
            }
            return {};
          }
        }

        return {
          hierarchicalFacets: [{
            attributes: attributes,
            name: hierarchicalFacetName,
            separator: separator,
            rootPath: rootPath
          }]
        };
      },

      init: function init(_ref2) {
        var createURL = _ref2.createURL,
            helper = _ref2.helper,
            instantSearchInstance = _ref2.instantSearchInstance;

        this._createURL = function (facetValue) {
          if (!facetValue) {
            var breadcrumb = helper.getHierarchicalFacetBreadcrumb(hierarchicalFacetName);
            if (breadcrumb.length > 0) {
              return createURL(helper.state.toggleRefinement(hierarchicalFacetName, breadcrumb[0]));
            }
          }
          return createURL(helper.state.toggleRefinement(hierarchicalFacetName, facetValue));
        };

        this._refine = function (facetValue) {
          if (!facetValue) {
            var breadcrumb = helper.getHierarchicalFacetBreadcrumb(hierarchicalFacetName);
            if (breadcrumb.length > 0) {
              helper.toggleRefinement(hierarchicalFacetName, breadcrumb[0]).search();
            }
          } else {
            helper.toggleRefinement(hierarchicalFacetName, facetValue).search();
          }
        };

        renderFn({
          createURL: this._createURL,
          canRefine: false,
          instantSearchInstance: instantSearchInstance,
          items: [],
          refine: this._refine,
          widgetParams: widgetParams
        }, true);
      },
      render: function render(_ref3) {
        var instantSearchInstance = _ref3.instantSearchInstance,
            results = _ref3.results,
            state = _ref3.state;

        var _state$hierarchicalFa = _slicedToArray(state.hierarchicalFacets, 1),
            facetName = _state$hierarchicalFa[0].name;

        var facetsValues = results.getFacetValues(facetName);
        var items = shiftItemsValues(prepareItems(facetsValues));

        renderFn({
          canRefine: items.length > 0,
          createURL: this._createURL,
          instantSearchInstance: instantSearchInstance,
          items: items,
          refine: this._refine,
          widgetParams: widgetParams
        }, false);
      }
    };
  };
}

function prepareItems(obj) {
  return obj.data.reduce(function (result, currentItem) {
    if (currentItem.isRefined) {
      result.push({
        name: currentItem.name,
        value: currentItem.path
      });
      if (Array.isArray(currentItem.data)) {
        var children = prepareItems(currentItem);
        result = result.concat(children);
      }
    }
    return result;
  }, []);
}

function shiftItemsValues(array) {
  return array.map(function (x, idx) {
    return {
      name: x.name,
      value: idx + 1 === array.length ? null : array[idx + 1].value
    };
  });
}