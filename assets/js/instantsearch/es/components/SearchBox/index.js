var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable max-len, no-extra-parens */
import PropTypes from 'prop-types';
import React from 'preact-compat';

var _ref = React.createElement(
  'symbol',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    id: 'sbx-icon-search-12',
    viewBox: '0 0 40 41'
  },
  React.createElement('path', {
    d: 'M30.967 27.727l-.03-.03c-.778-.777-2.038-.777-2.815 0l-1.21 1.21c-.78.78-.778 2.04 0 2.817l.03.03 4.025-4.027zm1.083 1.084L39.24 36c.778.778.78 2.037 0 2.816l-1.21 1.21c-.777.778-2.038.78-2.816 0l-7.19-7.19 4.026-4.025zM15.724 31.45c8.684 0 15.724-7.04 15.724-15.724C31.448 7.04 24.408 0 15.724 0 7.04 0 0 7.04 0 15.724c0 8.684 7.04 15.724 15.724 15.724zm0-3.93c6.513 0 11.793-5.28 11.793-11.794 0-6.513-5.28-11.793-11.793-11.793C9.21 3.93 3.93 9.21 3.93 15.725c0 6.513 5.28 11.793 11.794 11.793z',
    fillRule: 'evenodd'
  })
);

var _ref2 = React.createElement(
  'symbol',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    id: 'sbx-icon-clear-2',
    viewBox: '0 0 20 20'
  },
  React.createElement('path', {
    d: 'M8.96 10L.52 1.562 0 1.042 1.04 0l.522.52L10 8.96 18.438.52l.52-.52L20 1.04l-.52.522L11.04 10l8.44 8.438.52.52L18.96 20l-.522-.52L10 11.04l-8.438 8.44-.52.52L0 18.96l.52-.522L8.96 10z',
    fillRule: 'evenodd'
  })
);

var _ref3 = React.createElement(
  'button',
  {
    type: 'submit',
    title: 'Submit your search query.',
    className: 'sbx-sffv__submit'
  },
  React.createElement(
    'svg',
    { role: 'img', 'aria-label': 'Search' },
    React.createElement('use', { xlinkHref: '#sbx-icon-search-12' })
  )
);

var _ref4 = React.createElement(
  'button',
  {
    type: 'reset',
    title: 'Clear the search query.',
    className: 'sbx-sffv__reset'
  },
  React.createElement(
    'svg',
    { role: 'img', 'aria-label': 'Reset' },
    React.createElement('use', { xlinkHref: '#sbx-icon-clear-2' })
  )
);

var SearchBox = function (_React$Component) {
  _inherits(SearchBox, _React$Component);

  function SearchBox() {
    _classCallCheck(this, SearchBox);

    return _possibleConstructorReturn(this, (SearchBox.__proto__ || Object.getPrototypeOf(SearchBox)).apply(this, arguments));
  }

  _createClass(SearchBox, [{
    key: 'clearInput',
    value: function clearInput() {
      if (this.input) {
        this.input.value = '';
      }
    }
  }, {
    key: 'validateSearch',
    value: function validateSearch(e) {
      e.preventDefault();
      if (this.input) {
        var inputValue = this.input.value;
        if (inputValue) this.props.onValidate();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          placeholder = _props.placeholder,
          _onChange = _props.onChange;

      var inputCssClasses = this.props.disabled ? 'sbx-sffv__input sbx-sffv__input-disabled' : 'sbx-sffv__input';
      var formCssClasses = this.props.disabled ? 'searchbox sbx-sffv sbx-sffv-disabled' : 'searchbox sbx-sffv';

      return React.createElement(
        'form',
        {
          noValidate: 'novalidate',
          className: formCssClasses,
          onReset: function onReset() {
            _onChange('');
          },
          onSubmit: function onSubmit(e) {
            return _this2.validateSearch(e);
          }
        },
        React.createElement(
          'svg',
          { xmlns: 'http://www.w3.org/2000/svg', style: { display: 'none' } },
          _ref,
          _ref2
        ),
        React.createElement(
          'div',
          { role: 'search', className: 'sbx-sffv__wrapper' },
          React.createElement('input', {
            type: 'search',
            name: 'search',
            placeholder: placeholder,
            autoComplete: 'off',
            required: 'required',
            className: inputCssClasses,
            onChange: function onChange(e) {
              return _onChange(e.target.value);
            },
            ref: function ref(i) {
              _this2.input = i;
            },
            disabled: this.props.disabled
          }),
          _ref3,
          _ref4
        )
      );
    }
  }]);

  return SearchBox;
}(React.Component);

export default SearchBox;