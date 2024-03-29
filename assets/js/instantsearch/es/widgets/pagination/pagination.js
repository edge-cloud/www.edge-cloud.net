import defaults from 'lodash/defaults';

import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import Pagination from '../../components/Pagination/Pagination.js';
import connectPagination from '../../connectors/pagination/connectPagination.js';

import { bemHelper, getContainerNode } from '../../lib/utils.js';

var defaultLabels = {
  previous: '‹',
  next: '›',
  first: '«',
  last: '»'
};

var bem = bemHelper('ais-pagination');

var renderer = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      labels = _ref.labels,
      showFirstLast = _ref.showFirstLast,
      padding = _ref.padding,
      autoHideContainer = _ref.autoHideContainer,
      scrollToNode = _ref.scrollToNode;
  return function (_ref2, isFirstRendering) {
    var createURL = _ref2.createURL,
        currentRefinement = _ref2.currentRefinement,
        nbHits = _ref2.nbHits,
        nbPages = _ref2.nbPages,
        refine = _ref2.refine;

    if (isFirstRendering) return;

    var setCurrrentPage = function setCurrrentPage(pageNumber) {
      refine(pageNumber);

      if (scrollToNode !== false) {
        scrollToNode.scrollIntoView();
      }
    };

    var shouldAutoHideContainer = autoHideContainer && nbHits === 0;

    render(React.createElement(Pagination, {
      createURL: createURL,
      cssClasses: cssClasses,
      currentPage: currentRefinement,
      labels: labels,
      nbHits: nbHits,
      nbPages: nbPages,
      padding: padding,
      setCurrentPage: setCurrrentPage,
      shouldAutoHideContainer: shouldAutoHideContainer,
      showFirstLast: showFirstLast
    }), containerNode);
  };
};

var usage = 'Usage:\npagination({\n  container,\n  [ cssClasses.{root,item,page,previous,next,first,last,active,disabled}={} ],\n  [ labels.{previous,next,first,last} ],\n  [ maxPages ],\n  [ padding=3 ],\n  [ showFirstLast=true ],\n  [ autoHideContainer=true ],\n  [ scrollTo=\'body\' ]\n})';

/**
 * @typedef {Object} PaginationCSSClasses
 * @property  {string|string[]} [root] CSS classes added to the parent `<ul>`.
 * @property  {string|string[]} [item] CSS classes added to each `<li>`.
 * @property  {string|string[]} [link] CSS classes added to each link.
 * @property  {string|string[]} [page] CSS classes added to page `<li>`.
 * @property  {string|string[]} [previous] CSS classes added to the previous `<li>`.
 * @property  {string|string[]} [next] CSS classes added to the next `<li>`.
 * @property  {string|string[]} [first] CSS classes added to the first `<li>`.
 * @property  {string|string[]} [last] CSS classes added to the last `<li>`.
 * @property  {string|string[]} [active] CSS classes added to the active `<li>`.
 * @property  {string|string[]} [disabled] CSS classes added to the disabled `<li>`.
 */

/**
 * @typedef {Object} PaginationLabels
 * @property  {string} [previous] Label for the Previous link.
 * @property  {string} [next] Label for the Next link.
 * @property  {string} [first] Label for the First link.
 * @property  {string} [last] Label for the Last link.
 */

/**
 * @typedef {Object} PaginationWidgetOptions
 * @property  {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property  {number} [maxPages] The max number of pages to browse.
 * @property  {number} [padding=3] The number of pages to display on each side of the current page.
 * @property  {string|HTMLElement|boolean} [scrollTo='body'] Where to scroll after a click, set to `false` to disable.
 * @property  {boolean} [showFirstLast=true] Define if the First and Last links should be displayed.
 * @property  {boolean} [autoHideContainer=true] Hide the container when no results match.
 * @property  {PaginationLabels} [labels] Text to display in the various links (prev, next, first, last).
 * @property  {PaginationCSSClasses} [cssClasses] CSS classes to be added.
 */

/**
 * The pagination widget allow the user to switch between pages of the results.
 *
 * This is an alternative to using the *show more* pattern, that allows the user
 * only to display more items. The *show more* pattern is usually prefered
 * because it is simpler to use, and it is more convenient in a mobile context.
 * See the infinite hits widget, for more informations.
 *
 * When using the pagination with Algolia, you should be aware that the engine won't provide you pages
 * beyond the 1000th hits by default. You can find more information on the [Algolia documentation](https://www.algolia.com/doc/guides/searching/pagination/#pagination-limitations).
 *
 * @type {WidgetFactory}
 * @category navigation
 * @param {PaginationWidgetOptions} $0 Options for the Pagination widget.
 * @return {Widget} A new instance of Pagination widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.pagination({
 *     container: '#pagination-container',
 *     maxPages: 20,
 *     // default is to scroll to 'body', here we disable this behavior
 *     scrollTo: false,
 *     showFirstLast: false,
 *   })
 * );
 */
export default function pagination() {
  var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      container = _ref3.container,
      _ref3$labels = _ref3.labels,
      userLabels = _ref3$labels === undefined ? defaultLabels : _ref3$labels,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === undefined ? {} : _ref3$cssClasses,
      maxPages = _ref3.maxPages,
      _ref3$padding = _ref3.padding,
      padding = _ref3$padding === undefined ? 3 : _ref3$padding,
      _ref3$showFirstLast = _ref3.showFirstLast,
      showFirstLast = _ref3$showFirstLast === undefined ? true : _ref3$showFirstLast,
      _ref3$autoHideContain = _ref3.autoHideContainer,
      autoHideContainer = _ref3$autoHideContain === undefined ? true : _ref3$autoHideContain,
      _ref3$scrollTo = _ref3.scrollTo,
      userScrollTo = _ref3$scrollTo === undefined ? 'body' : _ref3$scrollTo;

  if (!container) {
    throw new Error(usage);
  }

  var containerNode = getContainerNode(container);

  var scrollTo = userScrollTo === true ? 'body' : userScrollTo;
  var scrollToNode = scrollTo !== false ? getContainerNode(scrollTo) : false;

  var cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem('item'), userCssClasses.item),
    link: cx(bem('link'), userCssClasses.link),
    page: cx(bem('item', 'page'), userCssClasses.page),
    previous: cx(bem('item', 'previous'), userCssClasses.previous),
    next: cx(bem('item', 'next'), userCssClasses.next),
    first: cx(bem('item', 'first'), userCssClasses.first),
    last: cx(bem('item', 'last'), userCssClasses.last),
    active: cx(bem('item', 'active'), userCssClasses.active),
    disabled: cx(bem('item', 'disabled'), userCssClasses.disabled)
  };

  var labels = defaults(userLabels, defaultLabels);

  var specializedRenderer = renderer({
    containerNode: containerNode,
    cssClasses: cssClasses,
    labels: labels,
    showFirstLast: showFirstLast,
    padding: padding,
    autoHideContainer: autoHideContainer,
    scrollToNode: scrollToNode
  });

  try {
    var makeWidget = connectPagination(specializedRenderer, function () {
      return unmountComponentAtNode(containerNode);
    });
    return makeWidget({ maxPages: maxPages });
  } catch (e) {
    throw new Error(usage);
  }
}