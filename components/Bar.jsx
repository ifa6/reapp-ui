var React = require('react/addons');
var Component = require('../component');
var BarItem = require('./BarItem');
var clone = require('../lib/niceClone');

module.exports = Component({
  name: 'Bar',

  propTypes: {
    barItemProps: React.PropTypes.object,
    position: React.PropTypes.string,
    activeIndexIndex: React.PropTypes.number,
    wrap: React.PropTypes.bool
  },

  render() {
    var {
      display,
      children,
      barItemProps,
      activeIndex,
      position,
      wrap,
      ...props } = this.props;

    if (position)
      this.addStyles(`position-${position}`);

    return (
      <ul {...this.componentProps()} {...props}>
        {React.Children.map(children, (child, i) => {
          var childProps = {
            display,
            active: i === activeIndex,
            key: i
          };

          if (wrap)
            return (
              <BarItem {...barItemProps} {...childProps}>
                {child}
              </BarItem>
            );

          return clone(child, childProps);
        })}
      </ul>
    );
  }
});