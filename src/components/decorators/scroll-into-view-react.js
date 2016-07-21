import R from 'ramda';
import React from 'react';
import ReactDOM from 'react-dom';

const getDisplayName = (Component) => (
  Component.displayName || Component.name || 'Component'
);

const calcScrollTop = (scrollTop, targetHeight, elementTop, elementHeight) => {
  // over the top.
  if (elementTop < scrollTop) {
    return elementTop;
  }
  else {
    let targetBottom = elementTop - targetHeight + elementHeight;

    // below the bottom.
    if (targetBottom > scrollTop) {
      // too big to fit into the view.
      if (elementTop < targetBottom) {
        return elementTop
      }

      return targetBottom
    }
    // already in view.
    else {
      return -1;
    }
  }
};

const bindMouseEvents = R.once((node, setHover) => {
  node.addEventListener('mouseenter', () => setHover(true));
  node.addEventListener('mouseleave', () => setHover(false));
});

const isNotHover = (() => {
  let isHover = false;
  return ({ node }) => {
    bindMouseEvents(node, (value) => isHover = value);
    return !isHover;
  }
})();

const isElementVisible = ({ node }) =>(
  node && node instanceof Element
    && node.tagName !== 'NOSCRIPT'
    && node.offsetHeight
);

const isAnchorElement = ({ anchor }) => (
  anchor && anchor instanceof Element
);

const getAnchor = ({ node, selector }) => ({
  node: node,
  anchor: node.querySelector(selector)
    || node.lastChild
});

const scrollTo = ({ node, scrollTop }) => {
  if (scrollTop >= 0) {
    node.scrollTop = scrollTop;
  }
};

const getScrollTop = ({ node, anchor }) => ({
  node: node,
  scrollTop: calcScrollTop(
    node.scrollTop,
    node.offsetHeight,
    anchor.offsetTop,
    anchor.offsetHeight
  )
});

const isDiffAnchor = (() => {
  let prev = 0;

  return ({ anchor }) => (
    (prev !== anchor)
      ? prev = anchor
      : false
  );
})();

const scrollToDiffAnchor = R.when(
  isDiffAnchor,
  R.pipe(
    getScrollTop,
    scrollTo
  )
);

const scrollToAnchor = R.pipe(
  getAnchor,
  R.when(
    isAnchorElement,
    scrollToDiffAnchor
  )
);

const scrollToSelector = R.when(
  R.allPass([isElementVisible, isNotHover]),
  scrollToAnchor
);

export const scrollIntoView = (Component, selector) => (
  React.createClass({
    displayName: getDisplayName(Component),
    getDefaultProps: () => ({}),
    getInitialState: () => ({}),

    componentDidUpdate: function() {
      scrollToSelector({
        node: ReactDOM.findDOMNode(this),
        selector: selector
      });
    },

    render: function() {
      return React.createElement(
        Component, this.props);
    }
  })
);
