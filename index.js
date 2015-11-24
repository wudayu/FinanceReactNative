'use strict';

var React = require('react-native');
var store = require('react-native-simple-store');
var NavigationBar = require('react-native-navbar');

var {
  // 使用Navigator在应用的不同界面中穿越
  Navigator,
  StatusBarIOS,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  Platform,
  ToolbarAndroid,
  BackAndroid,
} = React;

// Flux
var StockActions = require('./App/Utils/Stock/actions');

// Views
var AddNewView = require('./App/Views/AddNew');
var SettingsView = require('./App/Views/Settings');
var StocksView = require('./App/Views/Stocks');
var WebView = require('./App/Views/Web');

// Styles
var styles = require('./style');

Platform.OS === 'ios' ? StatusBarIOS.setStyle('default', false): null;

var _navigator;

var NavToolbar = React.createClass({

  componentWillMount: function() {
    var navigator = this.props.navigator;
  },

  render: function () {
    if (this.props.navIcon) {
      return (
        <ToolbarAndroid
          style={styles.toolbar}
          navIcon={{uri: 'ic_arrow_back_white_24dp', isStatic: true}}
          onIconClicked={this.props.navigator.pop}
          actions={this.props.actions}
          onActionSelected={this.props.onActionSelected}
          title={this.props.route.title}
          titleColor='white' />
      )
    }
    return (
      <ToolbarAndroid
        style={styles.toolbar}
        onIconClicked={this.props.navigator.pop}
        actions={this.props.actions}
        onActionSelected={this.props.onActionSelected}
        titleColor='white'
        title='Finance' />
    )
  }
})

BackAndroid.addEventListener('hardwareBackPress', () => {
  if (_navigator.getCurrentRoutes().length === 1  ) {
     return false;
  }
  _navigator.pop();
  return true;
});

var Finance = React.createClass({
  getInitialState: function() {
    return {};
  },

  configureSceneAndroid: function(route) {
    return Navigator.SceneConfigs.FadeAndroid;
  },

  configureSceneIOS: function(route) {
    switch (route.id) {
      case 'settings':
        return Navigator.SceneConfigs.FloatFromBottom;
      case 'add':
        return Navigator.SceneConfigs.FloatFromBottom;
      case 'yahoo':
        return Navigator.SceneConfigs.HorizontalSwipeJump;
      default:
        return Navigator.SceneConfigs.FloatFromBottom;
    }
  },

  renderSceneAndroid: function(route, navigator) {
    _navigator = navigator;
    if (route.id === 'stocks') {
      return (
        <View style={styles.container}>
          <NavToolbar
            navigator={navigator}
            route={route}
            actions={[{title: 'Reload', icon: require('image!ic_reload_white'), show: 'always'}]}
            onActionSelected={() => StockActions.updateStocks()} />
          <StocksView navigator={navigator} route={route} />
        </View>
      );
    }
    if (route.id === 'settings') {
      return (
        <View style={styles.container}>
          <NavToolbar
            navIcon={true}
            navigator={navigator}
            route={route}
            actions={[{title: 'Add', icon: require('image!ic_plus_white'), show: 'always'}]}
            onActionSelected={() => _navigator.push({title: 'Add', id: 'add'})} />
          <SettingsView navigator={navigator} route={route} />
        </View>
      )
    }
    if (route.id === 'add') {
      return (
        <View style={styles.container}>
          <NavToolbar navigator={navigator} route={route} />
          <AddNewView navigator={navigator} route={route} />
        </View>
      )
    }
    // WebView is not working for Android App
    // if (route.id === 'yahoo') {
    //   return (
    //     <View style={styles.container}>
    //       <NavToolbar navIcon={true} navigator={navigator} route={route} />
    //       <WebView title={route.title} url={route.url} />
    //     </View>
    //   )
    // }
  },

  renderSceneIOS: function(route, navigator) {
    var Component = route.component;
    var navBar = route.navigationBar;

    switch (route.id) {
      case 'empty':
        //Com <View />;
      case 'stocks':
        Component = StocksView;
        navBar = null;
        break;
      case 'settings':
        Component = SettingsView;
        navBar = <NavigationBar
          style={styles.navBar}
          leftButton={{
            title: '＋',
            handler: () => navigator.push({title: 'Add', id: 'add'}),
            tintColor: '#3CABDA',
          }}
          rightButton={{
            title: 'Done',
            handler: () => navigator.pop(),
            tintColor: '#3CABDA',
          }}
          title={{"title": "Stocks", "tintColor": "white"}} />;
        break;
      case 'add':
        Component = AddNewView;
        navBar = null
        break;
      case 'yahoo':
        Component = WebView;
        navBar = <NavigationBar
          style={styles.navBar}
          leftButton={{
            title: 'Back',
            handler: () => navigator.pop(),
            tintColor: '#3CABDA',
          }}
          title={{"title": "Yahoo", "tintColor": "white"}} />;
        break;
      }

    if (navBar === null) {
      navBar = <View style={styles.statusBar} />;
    }

    return (
      <View style={styles.container}>
        {navBar}
        <Component
          navigator={navigator}
          route={route} />
      </View>
    );
  },

  render: function() {
    /*
      Navigator的renderScene属性接受function(route, navigator)形式的返回一个UI元素的函数
      (route, navigator) => <View balabala />
     */
    var renderScene = Platform.OS === 'ios' ? this.renderSceneIOS: this.renderSceneAndroid;
    /*
      Navigator在切换界面时的动画效果属性接受function(route)形式的反回类似于
      Navigator.SceneConfigs.FloatFromRight的元素的函数。
      (route) => Navigator.SceneConfigs.FloatFromRight
     */
    var configureScene = Platform.OS === 'ios' ? this.configureSceneIOS: this.configureSceneAndroid;

    return (
      <Navigator
        debugOverlay={false}
        // 初始化一个初始界面，用id来identify
        initialRoute={{title: 'Finance', id: 'stocks'}}
        // 新页面加载方式
        configureScene={configureScene}
        // 新页面绘制方式
        renderScene={renderScene}
      />
    );
  },
});

module.exports = Finance;
/**
 * Navigator 的方法
 *  
 * getCurrentRoutes() - returns the current list of routes
 * jumpBack() - Jump backward without unmounting the current scene
 * jumpForward() - Jump forward to the next scene in the route stack
 * jumpTo(route) - Transition to an existing scene without unmounting
 * push(route) - Navigate forward to a new scene, squashing any scenes that you could jumpForward to
 * pop() - Transition back and unmount the current scene
 * replace(route) - Replace the current scene with a new route
 * replaceAtIndex(route, index) - Replace a scene as specified by an index
 * replacePrevious(route) - Replace the previous scene
 * immediatelyResetRouteStack(routeStack) - Reset every scene with an array of routes
 * popToRoute(route) - Pop to a particular scene, as specified by its route. All scenes after it will be unmounted
 * popToTop() - Pop to the first scene in the stack, unmounting every other scene
 */
