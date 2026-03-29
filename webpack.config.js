const path = require('path');

module.exports = (env, options) => {
    const mode = options.mode || 'production';
    const isProduction = mode === 'production';

    console.log(`This is the Webpack 5 'mode': ${mode}`);

    return {
        mode,
        entry: './src/web/frontend.ts',
        devtool: isProduction ? false : 'inline-source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                    options: {
                        configFile: 'tsconfig.web.json'
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
        externals: {
            jQuery: 'jquery'
        },
        output: {
            filename: 'frontend.js',
            path: path.resolve(__dirname, isProduction ? 'dist/web/' : 'src/web/')
        }
    };
};
