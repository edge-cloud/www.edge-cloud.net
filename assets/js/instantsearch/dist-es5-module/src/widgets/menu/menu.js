'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = menu;

var _preactCompat = require('preact-compat');

var _preactCompat2 = _interopRequireDefault(_preactCompat);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _defaultTemplates = require('./defaultTemplates.js');

var _defaultTemplates2 = _interopRequireDefault(_defaultTemplates);

var _getShowMoreConfig = require('../../lib/show-more/getShowMoreConfig.js');

var _getShowMoreConfig2 = _interopRequireDefault(_getShowMoreConfig);

var _connectMenu = require('../../connectors/menu/connectMenu.js');

var _connectMenu2 = _interopRequireDefault(_connectMenu);

var _RefinementList = require('../../components/RefinementList/RefinementList.js');

var _RefinementList2 = _interopRequireDefault(_RefinementList);

var _utils = require('../../lib/utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bem = (0, _utils.bemHelper)('ais-menu');

var renderer = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      collapsible = _ref.collapsible,
      autoHideContainer = _ref.autoHideContainer,
      renderState = _ref.renderState,
      templates = _ref.templates,
      transformData = _ref.transformData,
      showMoreConfig = _ref.showMoreConfig;
  return function (_ref2, isFirstRendering) {
    var refine = _ref2.refine,
        items = _ref2.items,
        createURL = _ref2.createURL,
        canRefine = _ref2.canRefine,
        instantSearchInstance = _ref2.instantSearchInstance,
        isShowingMore = _ref2.isShowingMore,
        toggleShowMore = _ref2.toggleShowMore,
        canToggleShowMore = _ref2.canToggleShowMore;

    if (isFirstRendering) {
      renderState.templateProps = (0, _utils.prepareTemplateProps)({
        transformData: transformData,
        defaultTemplates: _defaultTemplates2.default,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates
      });
      return;
    }

    var facetValues = items.map(function (facetValue) {
      return _extends({}, facetValue, {
        url: createURL(facetValue.name)
      });
    });
    var shouldAutoHideContainer = autoHideContainer && !canRefine;

    (0, _preactCompat.render)(_preactCompat2.default.createElement(_RefinementList2.default, {
      collapsible: collapsible,
      createURL: createURL,
      cssClasses: cssClasses,
      facetValues: facetValues,
      shouldAutoHideContainer: shouldAutoHideContainer,
      showMore: showMoreConfig !== null,
      templateProps: renderState.templateProps,
      toggleRefinement: refine,
      toggleShowMore: toggleShowMore,
      isShowingMore: isShowingMore,
      canToggleShowMore: canToggleShowMore
    }), containerNode);
  };
};

var usage = 'Usage:\nmenu({\n  container,\n  attributeName,\n  [ sortBy=[\'name:asc\'] ],\n  [ limit=10 ],\n  [ cssClasses.{root,list,item} ],\n  [ templates.{header,item,footer} ],\n  [ transformData.{item} ],\n  [ autoHideContainer ],\n  [ showMore.{templates: {active, inactive}, limit} ],\n  [ collapsible=false ]\n})';

/**
 * @typedef {Object} MenuCSSClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [header] CSS class to add to the header element.
 * @property {string|string[]} [body] CSS class to add to the body element.
 * @property {string|string[]} [footer] CSS class to add to the footer element.
 * @property {string|string[]} [list] CSS class to add to the list element.
 * @property {string|string[]} [item] CSS class to add to each item element.
 * @property {string|string[]} [active] CSS class to add to each active element.
 * @property {string|string[]} [link] CSS class to add to each link (when using the default template).
 * @property {string|string[]} [count] CSS class to add to each count element (when using the default template).
 */

/**
 * @typedef {Object} MenuTemplates
 * @property {string|Function} [header] Header template.
 * @property {string|Function(name: string, count: number, isRefined: boolean)} [item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties.
 * @property {string|Function} [footer] Footer template.
 */

/**
 * @typedef {Object} MenuShowMoreOptions
 * @property {MenuShowMoreTemplates} [templates] Templates to use for showMore.
 * @property {number} [limit] Max number of facets values to display when showMore is clicked.
 */

/**
 * @typedef {Object} MenuShowMoreTemplates
 * @property {string} [active] Template used when showMore was clicked.
 * @property {string} [inactive] Template used when showMore not clicked.
 */

/**
 * @typedef {Object} MenuTransforms
 * @property {function} [item] Method to change the object passed to the `item` template.
 */

/**
 * @typedef {Object} MenuWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string} attributeName Name of the attribute for faceting
 * @property {string[]|function} [sortBy=['name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax). [*]
 * @property {MenuTemplates} [templates] Customize the output through templating.
 * @property {string} [limit=10] How many facets values to retrieve [*].
 * @property {boolean|MenuShowMoreOptions} [showMore=false] Limit the number of results and display a showMore button.
 * @property {MenuShowMoreTemplates} [templates] Templates to use for the widget.
 * @property {MenuTransforms} [transformData] Set of functions to update the data before passing them to the templates.
 * @property {boolean} [autoHideContainer=true] Hide the container when there are no items in the menu.
 * @property {MenuCSSClasses} [cssClasses] CSS classes to add to the wrapping elements.
 * @property {boolean|{collapsible: boolean}} [collapsible=false] Hide the widget body and footer when clicking on header.
 */

/**
 * Create a menu based on a facet. A menu displays facet values and let the user selects only one value at a time.
 * It also displays an empty value which lets the user "unselect" any previous selection.
 *
 * @requirements
 * The attribute passed to `attributeName` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 * @type {WidgetFactory}
 * @category filter
 * @param {MenuWidgetOptions} $0 The Menu widget options.
 * @return {Widget} Creates a new instance of the Menu widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.menu({
 *     container: '#categories',
 *     attributeName: 'hierarchicalCategories.lvl0',
 *     limit: 10,
 *     templates: {
 *       header: 'Categories'
 *     }
 *   })
 * );
 */
function menu(_ref3) {
  var container = _ref3.container,
      attributeName = _ref3.attributeName,
      _ref3$sortBy = _ref3.sortBy,
      sortBy = _ref3$sortBy === undefined ? ['name:asc'] : _ref3$sortBy,
      _ref3$limit = _ref3.limit,
      limit = _ref3$limit === undefined ? 10 : _ref3$limit,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === undefined ? {} : _ref3$cssClasses,
      _ref3$templates = _ref3.templates,
      templates = _ref3$templates === undefined ? _defaultTemplates2.default : _ref3$templates,
      _ref3$collapsible = _ref3.collapsible,
      collapsible = _ref3$collapsible === undefined ? false : _ref3$collapsible,
      transformData = _ref3.transformData,
      _ref3$autoHideContain = _ref3.autoHideContainer,
      autoHideContainer = _ref3$autoHideContain === undefined ? true : _ref3$autoHideContain,
      _ref3$showMore = _ref3.showMore,
      showMore = _ref3$showMore === undefined ? false : _ref3$showMore;

  if (!container) {
    throw new Error(usage);
  }

  var showMoreConfig = (0, _getShowMoreConfig2.default)(showMore);
  if (showMoreConfig && showMoreConfig.limit < limit) {
    throw new Error('showMore.limit configuration should be > than the limit in the main configuration'); // eslint-disable-line
  }

  var containerNode = (0, _utils.getContainerNode)(container);

  var showMoreLimit = showMoreConfig && showMoreConfig.limit || undefined;
  var showMoreTemplates = showMoreConfig && (0, _utils.prefixKeys)('show-more-', showMoreConfig.templates);
  var allTemplates = showMoreTemplates ? _extends({}, templates, showMoreTemplates) : templates;

  var cssClasses = {
    root: (0, _classnames2.default)(bem(null), userCssClasses.root),
    header: (0, _classnames2.default)(bem('header'), userCssClasses.header),
    body: (0, _classnames2.default)(bem('body'), userCssClasses.body),
    footer: (0, _classnames2.default)(bem('footer'), userCssClasses.footer),
    list: (0, _classnames2.default)(bem('list'), userCssClasses.list),
    item: (0, _classnames2.default)(bem('item'), userCssClasses.item),
    active: (0, _classnames2.default)(bem('item', 'active'), userCssClasses.active),
    link: (0, _classnames2.default)(bem('link'), userCssClasses.link),
    count: (0, _classnames2.default)(bem('count'), userCssClasses.count)
  };

  var specializedRenderer = renderer({
    containerNode: containerNode,
    cssClasses: cssClasses,
    collapsible: collapsible,
    autoHideContainer: autoHideContainer,
    renderState: {},
    templates: allTemplates,
    transformData: transformData,
    showMoreConfig: showMoreConfig
  });

  try {
    var makeWidget = (0, _connectMenu2.default)(specializedRenderer, function () {
      return (0, _preactCompat.unmountComponentAtNode)(containerNode);
    });
    return makeWidget({ attributeName: attributeName, limit: limit, sortBy: sortBy, showMoreLimit: showMoreLimit });
  } catch (e) {
    throw new Error(usage);
  }
}