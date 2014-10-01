var path = require('path');
var webpack = require('webpack');
var ReactStylePlugin = require('react-style-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var loadersByExtension = require('./config/loadersByExtension');
var joinEntry = require('./config/joinEntry');
var Routes = require('./app/routes');

module.exports = function(options) {
  var entry = {};
  var main = reactEntry('main');

  Routes.forEach(function(route) {
    entry[route.name] = main;
  });

  var reactStyleLoader = ReactStylePlugin.loader();
  var jsxLoader = [
    reactStyleLoader,
    'jsx-loader?harmony&insertPragma=React.DOM'
  ];

  if (options.hotComponents)
    jsxLoader.unshift('react-hot');

  var loaders = {
    'coffee': 'coffee-redux-loader',
    'jsx': jsxLoader,
    'json': 'json-loader',
    'json5': 'json5-loader',
    'txt': 'raw-loader',
    'png|jgp|jpeg|gif|svg': 'url-loader?limit=10000',
    'woff': 'url-loader?limit=100000',
    'ttf': 'file-loader',
    'wav|mp3': 'file-loader',
    'html': 'html-loader',
    'md|markdown': ['html-loader', 'markdown-loader'],
  };

  var stylesheetLoaders = {
    'css': 'css-loader',
    'styl': 'css-loader!stylus-loader',
    'sass': 'css-loader!sass-loader',
  }

  var alias = {};
  var aliasLoader = {};
  var externals = [];
  var modulesDirectories = ['web_modules', 'node_modules'];
  var extensions = ['', '.web.js', '.js', '.jsx'];
  var root = path.join(__dirname, 'app');

  var output = {
    path: path.join(__dirname, 'build', options.prerender ? 'prerender' : 'public'),
    publicPath: '/',
    filename: '[name].js' + (options.longTermCaching && !options.prerender ? '?[chunkhash]' : ''),
    chunkFilename: (options.devServer ? '[id].js' : '[name].js') + (options.longTermCaching && !options.prerender ? '?[chunkhash]' : ''),
    sourceMapFilename: 'debugging/[file].map',
    libraryTarget: options.prerender ? 'commonjs2' : undefined,
    pathinfo: options.debug,
  };

  var statsPlugin = function() {
    if (!options.prerender) {
      this.plugin('done', function(stats) {
        require('fs').writeFileSync(path.join(__dirname, 'build', 'stats.json'), JSON.stringify(stats.toJson({
          chunkModules: true,
          exclude: [
            /node_modules[\\\/]react/
          ]
        })));
      });
    }
  };

  var plugins = [
    statsPlugin,
    new webpack.PrefetchPlugin('react'),
    new webpack.PrefetchPlugin('react/lib/ReactComponentBrowserEnvironment'),
    // new ReactStylePlugin('bundle.css')
  ];

  if (options.prerender) {
    aliasLoader['react-proxy$'] = 'react-proxy/unavailable';
    externals.push(/^react(\/.*)?$/, /^reflux(\/.*)?$/);
    plugins.push(new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }));
  }

  if (options.hotComponents) {
    plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  if (options.commonsChunk) {
    plugins.push(new webpack.optimize.CommonsChunkPlugin('commons', 'commons.js' + (options.longTermCaching && !options.prerender ? '?[chunkhash]' : '')));
  }

  function reactEntry(name) {
    return (options.prerender ? './config/prerender?' : './config/app?') + name;
  }

  if (options.devServer) {
    if (options.hot) {
      entry = joinEntry('webpack/hot/dev-server', entry);
    }
    entry = joinEntry('webpack-dev-server/client?http://localhost:2992', entry);
  }

  Object.keys(stylesheetLoaders).forEach(function(ext) {
    var loaders = stylesheetLoaders[ext];
    if (Array.isArray(loaders))
      loaders = loaders.join('!');

    if (options.prerender) {
      stylesheetLoaders[ext] = 'null-loader';
    }
    else if(options.separateStylesheet) {
      stylesheetLoaders[ext] = ExtractTextPlugin.extract('style-loader', loaders);
    }
    else {
      stylesheetLoaders[ext] = 'style-loader!' + loaders;
    }
  });

  if (options.separateStylesheet && !options.prerender) {
    plugins.push(new ExtractTextPlugin('[name].css'));
  }

  if (options.minimize) {
    plugins.push(
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      })
    );
  }

  var finalConfig = {
    entry: entry,
    output: output,
    target: options.prerender ? 'node' : 'web',
    module: {
      loaders: loadersByExtension(loaders).concat(loadersByExtension(stylesheetLoaders))
    },
    devtool: options.devtool,
    debug: options.debug,
    resolveLoader: {
      root: path.join(__dirname, 'node_modules'),
      alias: aliasLoader
    },
    externals: externals,
    resolve: {
      root: root,
      modulesDirectories: modulesDirectories,
      extensions: extensions,
      alias: alias,
    },
    plugins: plugins
  };

  return finalConfig;
};