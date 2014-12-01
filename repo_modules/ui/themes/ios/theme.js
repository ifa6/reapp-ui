var { makeTheme } = require('../../index');
var requirer = (name) => require('./styles/' + name);

module.exports = makeTheme(requirer, [
  'Badge',
  'Block',
  'Button',
  'Container',
  'DottedViewList',
  'Dots',
  'Drawer',
  'LayoutLeftNav',
  'List',
  'ListItem',
  'ListTitle',
  'Menu',
  'Modal',
  'Pad',
  'Popover',
  'TabItem',
  'Tabs',
  'TitleBar',
  'View',
  'ViewLeft',
  'ViewList',
  'ViewMain'
]);