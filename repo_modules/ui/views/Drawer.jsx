var ViewComponent = require('ui/viewcomponent');
var TouchableArea = require('../helpers/TouchableArea');
var AnimatableContainer = require('../helpers/AnimatableContainer');
var DrawerBehavior = require('./DrawerBehavior');
var TweenState = require('react-tween-state');
var { Scroller } = require('scroller');

module.exports = ViewComponent('Drawer', {
  mixins: [TweenState.Mixin],

  getDefaultProps() {
    return {
      behavior: DrawerBehavior,
      parents: null
    };
  },

  getInitialState() {
    return {
      externalScroller: !!this.props.scroller,
      xOffset: 0,
      isClosed: false
    };
  },

  componentWillMount() {
    if (this.state.externalScroller) return;
    this.scroller = new Scroller(this.handleScroll, {
      bouncing: false,
      scrollingX: true,
      scrollingY: false,
      snapping: true
    });
  },

  enter(cb) {
    console.log('ENTER', this.state.xOffset);
    this.tweenState('xOffset', {
      easing: TweenState.easingTypes.easeInOutQuad,
      duration: 300,
      endValue: window.innerWidth,
      onEnd: cb
    });
  },

  componentDidMount() {
    this.measureScroller();
    this.enter(this.scrollToOpen);
    window.addEventListener('resize', this.measureAndScrollOpen);
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.measureAndScrollOpen);
    this.transformParents('none');
  },

  scrollToOpen() {
    if (this.scroller)
      this.scroller.scrollTo(this.getDOMNode().clientWidth, 0);
  },

  measureScroller() {
    if (this.state.externalScroller) return;
    var node = this.getDOMNode();
    this.scroller.setDimensions(
      node.clientWidth,
      node.clientHeight,
      node.clientWidth * 2,
      node.clientHeight
    );
    this.scroller.setSnapSize(node.clientWidth, node.clientHeight);
  },

  measureAndScrollOpen() {
    console.log('measure and scroll open');
    this.measureScroller();
    this.scrollToOpen();
  },

  handleScroll(left) {
    console.log(left);
    this.setState({
      xOffset: left,
      isClosed: left === 0
    });

    this.transformParents('translate3d(-' + (left / 2) + 'px, 0, 0)');
  },

  transformParents(transform) {
    if (this.props.parents) {
      [].concat(this.props.parents).map(parent => {
        document.getElementById(parent).style.transform = transform;
      });
    }
  },

  render() {
    var { translate, behavior, scroller, touchableProps, children, ...props } = this.props;

    props.translate = (
      translate || behavior.translate(this.state.xOffset)
    );

    this.addClass('closed', this.state.isClosed);
    this.addStyles('dragger', {
      left: this.state.isClosed ? -10 : 0,
      zIndex: this.getZIndexForLayer() + 1
    });

    return (
      <AnimatableContainer {...props} {...this.componentProps()}>
        <TouchableArea {...this.componentProps('dragger')} {...touchableProps}
          scroller={scroller || this.scroller} />
        {children}
      </AnimatableContainer>
    );
  }
});