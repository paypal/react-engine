'use strict';

module.exports = {

    entry: './public/index.js',

    output: {
        path: __dirname + '/public',
        filename: 'bundle.js'
    },

    module: {
        loaders: [
            {
                //tell webpack to use jsx-loader for all *.jsx files
                test: /\.jsx$/,
                loader: 'jsx-loader?insertPragma=React.DOM&harmony'
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ]
    },

    resolve: {
        extensions: ['', '.js', '.jsx', '.json']
    }
};
