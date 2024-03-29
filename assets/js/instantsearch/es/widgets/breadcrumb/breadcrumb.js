import React, { render } from 'preact-compat';
import cx from 'classnames';

import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { connectBreadcrumb } from '../../connectors';
import defaultTemplates from './defaultTemplates.js';

import { bemHelper, getContainerNode, prepareTemplateProps } from '../../lib/utils';

var bem = bemHelper('ais-breadcrumb');

var renderer = function renderer(_ref) {
  var autoHideContainer = _ref.autoHideContainer,
      containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      renderState = _ref.renderState,
      separator = _ref.separator,
      templates = _ref.templates,
      transformData = _ref.transformData;
  return function (_ref2, isFirstRendering) {
    var canRefine = _ref2.canRefine,
        createURL = _ref2.createURL,
        instantSearchInstance = _ref2.instantSearchInstance,
        items = _ref2.items,
        refine = _ref2.refine;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates,
        transformData: transformData
      });
      return;
    }

    var shouldAutoHideContainer = autoHideContainer && !canRefine;

    render(React.createElement(Breadcrumb, {
      canRefine: canRefine,
      cssClasses: cssClasses,
      createURL: createURL,
      items: items,
      refine: refine,
      separator: separator,
      shouldAutoHideContainer: shouldAutoHideContainer,
      templateProps: renderState.templateProps
    }), containerNode);
  };
};

var usage = 'Usage:\nbreadcrumb({\n  container,\n  attributes,\n  [ autoHideContainer=true ],\n  [ cssClasses.{disabledLabel, home, label, root, separator}={} ],\n  [ templates.{home, separator}]\n  [ transformData.{item} ],\n  \n})';

/**
 * @typedef {Object} BreadcrumbCSSClasses
 * @property {string|string[]} [disabledLabel] CSS class to add to the last element of the breadcrumb (which is not clickable).
 * @property {string|string[]} [home] CSS class to add to the first element of the breadcrumb.
 * @property {string|string[]} [label] CSS class to add to the text part of each element of the breadcrumb.
 * @property {string|string[]} [root] CSS class to add to the root element of the widget.
 * @property {string|string[]} [separator] CSS class to add to the separator.
 */

/**
 * @typedef {Object} BreadcrumbTemplates
 * @property {string|function(object):string} [home='Home'] Label of the breadcrumb's first element.
 * @property {string|function(object):string} [separator=''] Symbol used to separate the elements of the breadcrumb.
 */

/**
 * @typedef {Object} BreadcrumbTransforms
 * @property {function(object):object} [item] Method to change the object passed to the `item` template
 */

/**
 * @typedef {Object} BreadcrumbWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string[]} attributes Array of attributes to use to generate the breadcrumb.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 * @property {BreadcrumbTemplates} [templates] Templates to use for the widget.
 * @property {BreadcrumbTransforms} [transformData] Set of functions to transform the data passed to the templates.
 * @property {boolean} [autoHideContainer=true] Hides the container when there are no items in the breadcrumb.
 * @property {BreadcrumbCSSClasses} [cssClasses] CSS classes to add to the wrapping elements.
 */

/**
 * The breadcrumb widget is a secondary navigation scheme that allows the user to see where the current page is in relation to the facet's hierarchy.
 * 
 * It reduces the number of actions a user needs to take in order to get to a higher-level page and improve the findability of the app or website's sections and pages.
 * It is commonly used for websites with a large amount of data organized into categories with subcategories.
 *
 * All attributes (lvl0, lvl1 in this case) must be declared as [attributes for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting) in your
 * Algolia settings.
 *
 * @requirements
 * Your objects must be formatted in a specific way to be
 * able to display a breadcrumb. Here's an example:
 *
 * ```javascript
 * {
 *   "objectID": "123",
 *   "name": "orange",
 *   "categories": {
 *     "lvl0": "fruits",
 *     "lvl1": "fruits > citrus"
 *   }
 * }
 * ```
 *
 * Each level must be specified entirely.
 * It's also possible to have multiple values per level, for instance:
 *
 * ```javascript
 * {
 *   "objectID": "123",
 *   "name": "orange",
 *   "categories": {
 *     "lvl0": ["fruits", "vitamins"],
 *     "lvl1": ["fruits > citrus", "vitamins > C"]
 *   }
 * }
 * ```
 * @type {WidgetFactory}
 * @category navigation
 * @param {BreadcrumbWidgetOptions} $0 The Breadcrumb widget options.
 * @return {Widget} A new Breadcrumb widget instance.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.Breadcrumb({
 *     container: '#breadcrumb',
 *     attributes: ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1', 'hierarchicalCategories.lvl2'],
 *     templates: { home: 'Home Page' }
 *     rootPath: 'Cameras & Camcorders > Digital Cameras',
 *   })
 * );
 */

export default function breadcrumb() {
  var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      attributes = _ref3.attributes,
      _ref3$autoHideContain = _ref3.autoHideContainer,
      autoHideContainer = _ref3$autoHideContain === undefined ? false : _ref3$autoHideContain,
      container = _ref3.container,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === undefined ? {} : _ref3$cssClasses,
      _ref3$rootPath = _ref3.rootPath,
      rootPath = _ref3$rootPath === undefined ? null : _ref3$rootPath,
      _ref3$separator = _ref3.separator,
      separator = _ref3$separator === undefined ? ' > ' : _ref3$separator,
      _ref3$templates = _ref3.templates,
      templates = _ref3$templates === undefined ? defaultTemplates : _ref3$templates,
      transformData = _ref3.transformData;

  if (!container) {
    throw new Error(usage);
  }

  var containerNode = getContainerNode(container);

  var cssClasses = {
    disabledLabel: cx(bem('disabledLabel'), userCssClasses.disabledLabel),
    home: cx(bem('home'), userCssClasses.home),
    item: cx(bem('item'), userCssClasses.item),
    label: cx(bem('label'), userCssClasses.label),
    root: cx(bem('root'), userCssClasses.root),
    separator: cx(bem('separator'), userCssClasses.separator)
  };

  var specializedRenderer = renderer({
    autoHideContainer: autoHideContainer,
    containerNode: containerNode,
    cssClasses: cssClasses,
    renderState: {},
    separator: separator,
    templates: templates,
    transformData: transformData
  });

  try {
    var makeBreadcrumb = connectBreadcrumb(specializedRenderer);
    return makeBreadcrumb({ attributes: attributes, rootPath: rootPath });
  } catch (e) {
    throw new Error(usage);
  }
}