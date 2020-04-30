const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const base = {

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    configFile: "tsconfig.web.json"
                }
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },

    watchOptions: {
        poll: true,
        ignored: /node_modules|vendor/
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        "jQuery": "jquery",

//        "chart.js": "Chart",
//        moment: 'moment'
    },
    entry: ['core-js/stable/promise', './app/js']
};


const frontend = Object.assign({}, base, {
    entry: './src/web/frontend.ts',
    devtool: 'inline-source-map',

    optimization: {
        minimize: false,
        minimizer: [
            new UglifyJsPlugin({
//                include: /\.min\.js$/
            })
        ]
    }

});

module.exports = (env, options) => {
    console.log(`This is the Webpack 4 'mode': ${options.mode}`);
    if (options.mode === 'production') {
        frontend.output = {
            filename: 'frontend.js',
            path: path.resolve(__dirname, 'dist/web/')
        };
    } else {
        frontend.output = {
            filename: 'frontend.js',
            path: path.resolve(__dirname, 'src/web/')
        };
    }

    return  [frontend];
}