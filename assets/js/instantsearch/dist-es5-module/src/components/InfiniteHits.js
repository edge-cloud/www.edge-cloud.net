'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _preactCompat = require('preact-compat');

var _preactCompat2 = _interopRequireDefault(_preactCompat);

var _Hits = require('./Hits.js');

var _Hits2 = _interopRequireDefault(_Hits);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function InfiniteHits(props) {
  var cssClasses = props.cssClasses,
      hits = props.hits,
      results = props.results,
      showMore = props.showMore,
      showMoreLabel = props.showMoreLabel,
      templateProps = props.templateProps;

  var btn = props.isLastPage ? _preactCompat2.default.createElement(
    'button',
    { disabled: true },
    showMoreLabel
  ) : _preactCompat2.default.createElement(
    'button',
    { onClick: showMore },
    showMoreLabel
  );

  return _preactCompat2.default.createElement(
    'div',
    null,
    _preactCompat2.default.createElement(_Hits2.default, {
      cssClasses: cssClasses,
      hits: hits,
      results: results,
      templateProps: templateProps
    }),
    _preactCompat2.default.createElement(
      'div',
      { className: cssClasses.showmore },
      btn
    )
  );
}

exports.default = InfiniteHits;