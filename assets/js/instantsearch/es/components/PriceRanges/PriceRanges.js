var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import PropTypes from 'prop-types';
import React from 'preact-compat';

import Template from '../Template.js';
import PriceRangesForm from './PriceRangesForm.js';
import cx from 'classnames';
import isEqual from 'lodash/isEqual';

import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';

export var RawPriceRanges = function (_React$Component) {
  _inherits(RawPriceRanges, _React$Component);

  function RawPriceRanges() {
    _classCallCheck(this, RawPriceRanges);

    return _possibleConstructorReturn(this, (RawPriceRanges.__proto__ || Object.getPrototypeOf(RawPriceRanges)).apply(this, arguments));
  }

  _createClass(RawPriceRanges, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.refine = this.refine.bind(this);
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return !isEqual(this.props.facetValues, nextProps.facetValues);
    }
  }, {
    key: 'getForm',
    value: function getForm() {
      var labels = _extends({
        currency: this.props.currency
      }, this.props.labels);

      var currentRefinement = void 0;
      if (this.props.facetValues.length === 1) {
        currentRefinement = {
          from: this.props.facetValues[0].from !== undefined ? this.props.facetValues[0].from : '',
          to: this.props.facetValues[0].to !== undefined ? this.props.facetValues[0].to : ''
        };
      } else {
        currentRefinement = { from: '', to: '' };
      }

      return React.createElement(PriceRangesForm, {
        cssClasses: this.props.cssClasses,
        currentRefinement: currentRefinement,
        labels: labels,
        refine: this.refine
      });
    }
  }, {
    key: 'getItemFromFacetValue',
    value: function getItemFromFacetValue(facetValue) {
      var cssClassItem = cx(this.props.cssClasses.item, _defineProperty({}, this.props.cssClasses.active, facetValue.isRefined));
      var key = facetValue.from + '_' + facetValue.to;
      var handleClick = this.refine.bind(this, facetValue);
      var data = _extends({
        currency: this.props.currency
      }, facetValue);
      return React.createElement(
        'div',
        { className: cssClassItem, key: key },
        React.createElement(
          'a',
          {
            className: this.props.cssClasses.link,
            href: facetValue.url,
            onClick: handleClick
          },
          React.createElement(Template, _extends({
            data: data,
            templateKey: 'item'
          }, this.props.templateProps))
        )
      );
    }
  }, {
    key: 'refine',
    value: function refine(range, event) {
      event.preventDefault();
      this.props.refine(range);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      return React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { className: this.props.cssClasses.list },
          this.props.facetValues.map(function (facetValue) {
            return _this2.getItemFromFacetValue(facetValue);
          })
        ),
        this.getForm()
      );
    }
  }]);

  return RawPriceRanges;
}(React.Component);

RawPriceRanges.defaultProps = {
  cssClasses: {}
};

export default autoHideContainerHOC(headerFooterHOC(RawPriceRanges));