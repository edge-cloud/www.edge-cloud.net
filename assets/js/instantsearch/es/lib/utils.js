var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

import reduce from 'lodash/reduce';
import forEach from 'lodash/forEach';
import find from 'lodash/find';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import uniq from 'lodash/uniq';
import mapKeys from 'lodash/mapKeys';

export { getContainerNode, bemHelper, prepareTemplateProps, isSpecialClick, isDomElement, getRefinements, clearRefinementsFromState, clearRefinementsAndSearch, prefixKeys, escapeRefinement, unescapeRefinement, checkRendering, isReactElement, deprecate };

/**
 * Return the container. If it's a string, it is considered a
 * css selector and retrieves the first matching element. Otherwise
 * test if it validates that it's a correct DOMElement.
 * @param {string|HTMLElement} selectorOrHTMLElement a selector or a node
 * @return {HTMLElement} The resolved HTMLElement
 * @throws Error when the type is not correct
 */
function getContainerNode(selectorOrHTMLElement) {
  var isFromString = typeof selectorOrHTMLElement === 'string';
  var domElement = void 0;
  if (isFromString) {
    domElement = document.querySelector(selectorOrHTMLElement);
  } else {
    domElement = selectorOrHTMLElement;
  }

  if (!isDomElement(domElement)) {
    var errorMessage = 'Container must be `string` or `HTMLElement`.';
    if (isFromString) {
      errorMessage += ' Unable to find ' + selectorOrHTMLElement;
    }
    throw new Error(errorMessage);
  }

  return domElement;
}

/**
 * Returns true if the parameter is a DOMElement.
 * @param {any} o the value to test
 * @return {boolean} true if o is a DOMElement
 */
function isDomElement(o) {
  return o instanceof window.HTMLElement || Boolean(o) && o.nodeType > 0;
}

function isSpecialClick(event) {
  var isMiddleClick = event.button === 1;
  return isMiddleClick || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

/**
 * Creates BEM class name according the vanilla BEM style.
 * @param {string} block the main block
 * @return {function} function that takes up to 2 parameters
 * that determine the element and the modifier of the BEM class.
 */
function bemHelper(block) {
  return function (element, modifier) {
    // block--element
    if (element && !modifier) {
      return block + '--' + element;
    }
    // block--element__modifier
    if (element && modifier) {
      return block + '--' + element + '__' + modifier;
    }
    // block__modifier
    if (!element && modifier) {
      return block + '__' + modifier;
    }

    return block;
  };
}

/**
 * Prepares an object to be passed to the Template widget
 * @param {object} unknownBecauseES6 an object with the following attributes:
 *  - transformData
 *  - defaultTemplate
 *  - templates
 *  - templatesConfig
 * @return {object} the configuration with the attributes:
 *  - transformData
 *  - defaultTemplate
 *  - templates
 *  - useCustomCompileOptions
 */
function prepareTemplateProps(_ref) {
  var transformData = _ref.transformData,
      defaultTemplates = _ref.defaultTemplates,
      templates = _ref.templates,
      templatesConfig = _ref.templatesConfig;

  var preparedTemplates = prepareTemplates(defaultTemplates, templates);

  return _extends({
    transformData: transformData,
    templatesConfig: templatesConfig
  }, preparedTemplates);
}

function prepareTemplates() {
  var defaultTemplates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var templates = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var allKeys = uniq([].concat(_toConsumableArray(keys(defaultTemplates)), _toConsumableArray(keys(templates))));

  return reduce(allKeys, function (config, key) {
    var defaultTemplate = defaultTemplates[key];
    var customTemplate = templates[key];
    var isCustomTemplate = customTemplate !== undefined && customTemplate !== defaultTemplate;

    config.templates[key] = isCustomTemplate ? customTemplate : defaultTemplate;
    config.useCustomCompileOptions[key] = isCustomTemplate;

    return config;
  }, { templates: {}, useCustomCompileOptions: {} });
}

function getRefinement(state, type, attributeName, name, resultsFacets) {
  var res = { type: type, attributeName: attributeName, name: name };
  var facet = find(resultsFacets, { name: attributeName });
  var count = void 0;
  if (type === 'hierarchical') {
    var facetDeclaration = state.getHierarchicalFacetByName(attributeName);
    var splitted = name.split(facetDeclaration.separator);
    res.name = splitted[splitted.length - 1];
    for (var i = 0; facet !== undefined && i < splitted.length; ++i) {
      facet = find(facet.data, { name: splitted[i] });
    }
    count = get(facet, 'count');
  } else {
    count = get(facet, 'data["' + res.name + '"]');
  }
  var exhaustive = get(facet, 'exhaustive');
  if (count !== undefined) {
    res.count = count;
  }
  if (exhaustive !== undefined) {
    res.exhaustive = exhaustive;
  }
  return res;
}

function getRefinements(results, state, clearsQuery) {
  var res = clearsQuery && state.query && state.query.trim() ? [{
    type: 'query',
    name: state.query,
    query: state.query
  }] : [];

  forEach(state.facetsRefinements, function (refinements, attributeName) {
    forEach(refinements, function (name) {
      res.push(getRefinement(state, 'facet', attributeName, name, results.facets));
    });
  });

  forEach(state.facetsExcludes, function (refinements, attributeName) {
    forEach(refinements, function (name) {
      res.push({ type: 'exclude', attributeName: attributeName, name: name, exclude: true });
    });
  });

  forEach(state.disjunctiveFacetsRefinements, function (refinements, attributeName) {
    forEach(refinements, function (name) {
      res.push(getRefinement(state, 'disjunctive', attributeName,
      // we unescapeRefinement any disjunctive refined value since they can be escaped
      // when negative numeric values search `escapeRefinement` usage in code
      unescapeRefinement(name), results.disjunctiveFacets));
    });
  });

  forEach(state.hierarchicalFacetsRefinements, function (refinements, attributeName) {
    forEach(refinements, function (name) {
      res.push(getRefinement(state, 'hierarchical', attributeName, name, results.hierarchicalFacets));
    });
  });

  forEach(state.numericRefinements, function (operators, attributeName) {
    forEach(operators, function (values, operator) {
      forEach(values, function (value) {
        res.push({
          type: 'numeric',
          attributeName: attributeName,
          name: '' + value,
          numericValue: value,
          operator: operator
        });
      });
    });
  });

  forEach(state.tagRefinements, function (name) {
    res.push({ type: 'tag', attributeName: '_tags', name: name });
  });

  return res;
}

function clearRefinementsFromState(inputState, attributeNames) {
  var clearsQuery = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var state = inputState;

  if (clearsQuery) {
    state = state.setQuery('');
  }

  if (isEmpty(attributeNames)) {
    state = state.clearTags();
    state = state.clearRefinements();
    return state;
  }

  forEach(attributeNames, function (attributeName) {
    if (attributeName === '_tags') {
      state = state.clearTags();
    } else {
      state = state.clearRefinements(attributeName);
    }
  });

  return state;
}

function clearRefinementsAndSearch(helper, attributeNames) {
  var clearsQuery = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  helper.setState(clearRefinementsFromState(helper.state, attributeNames, clearsQuery)).search();
}

function prefixKeys(prefix, obj) {
  if (obj) {
    return mapKeys(obj, function (v, k) {
      return prefix + k;
    });
  }

  return undefined;
}

function escapeRefinement(value) {
  if (typeof value === 'number' && value < 0) {
    value = String(value).replace(/^-/, '\\-');
  }

  return value;
}

function unescapeRefinement(value) {
  return String(value).replace(/^\\-/, '-');
}

function checkRendering(rendering, usage) {
  if (rendering === undefined || typeof rendering !== 'function') {
    throw new Error(usage);
  }
}

var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element') || 0xeac7;

function isReactElement(object) {
  return (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}

function deprecate(fn, message) {
  var hasAlreadyPrint = false;

  return function () {
    if (!hasAlreadyPrint) {
      hasAlreadyPrint = true;

      // eslint-disable-next-line no-console
      console.warn('[InstantSearch.js]: ' + message);
    }

    return fn.apply(undefined, arguments);
  };
}