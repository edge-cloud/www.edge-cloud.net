import PropTypes from 'prop-types';
import React from 'preact-compat';
import Hits from './Hits.js';

function InfiniteHits(props) {
  var cssClasses = props.cssClasses,
      hits = props.hits,
      results = props.results,
      showMore = props.showMore,
      showMoreLabel = props.showMoreLabel,
      templateProps = props.templateProps;

  var btn = props.isLastPage ? React.createElement(
    'button',
    { disabled: true },
    showMoreLabel
  ) : React.createElement(
    'button',
    { onClick: showMore },
    showMoreLabel
  );

  return React.createElement(
    'div',
    null,
    React.createElement(Hits, {
      cssClasses: cssClasses,
      hits: hits,
      results: results,
      templateProps: templateProps
    }),
    React.createElement(
      'div',
      { className: cssClasses.showmore },
      btn
    )
  );
}

export default InfiniteHits;