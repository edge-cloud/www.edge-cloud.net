var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import reduce from 'lodash/reduce';
import escape from 'lodash/escape';
import isPlainObject from 'lodash/isPlainObject';
import isArray from 'lodash/isArray';
import mapValues from 'lodash/mapValues';

export var tagConfig = {
  highlightPreTag: '__ais-highlight__',
  highlightPostTag: '__/ais-highlight__'
};

function replaceWithEmAndEscape(value) {
  return escape(value).replace(new RegExp(tagConfig.highlightPreTag, 'g'), '<em>').replace(new RegExp(tagConfig.highlightPostTag, 'g'), '</em>');
}

function recursiveEscape(input) {
  return reduce(input, function (output, value, key) {
    if (typeof value.value === 'string') {
      value.value = replaceWithEmAndEscape(value.value);
    }

    if (isPlainObject(value.value)) {
      value.value = mapValues(value.value, replaceWithEmAndEscape);
    }

    if (isArray(value.value)) {
      value.value = value.value.map(replaceWithEmAndEscape);
    }

    return _extends({}, output, _defineProperty({}, key, value));
  }, {});
}

export default function escapeHits(hits) {
  if (hits.__escaped === undefined) {
    hits.__escaped = true;

    return hits.map(function (hit) {
      if (hit._highlightResult) {
        hit._highlightResult = recursiveEscape(hit._highlightResult);
      }

      if (hit._snippetResult) {
        hit._snippetResult = recursiveEscape(hit._snippetResult);
      }

      return hit;
    });
  }

  return hits;
}

export function escapeFacets(facetHits) {
  return facetHits.map(function (h) {
    return _extends({}, h, {
      highlighted: replaceWithEmAndEscape(h.highlighted)
    });
  });
}