const path = require("path");

module.exports = {
    "mode":    "development",
    "entry": {
        "template": path.resolve(__dirname, "src/template.ts"),
    },
    "output":  {
        "path":     path.resolve(__dirname, "build"),
        "filename": "[name].js"
    },
    "devtool": "source-map",
    "resolve": {
        "extensions": [".ts", ".js"]
    },
    "module":  {
        "rules": [
            {
                "test":    /\.ts$/,
                "exclude": /node_modules/,
                "use":     {
                    "loader":  "ts-loader",
                    "options": {
                        "transpileOnly": true
                    }
                }
            },
            {
                "test": /\.scss$/,
                "exclude": /node_modules/,
                "use": [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader",   // translates CSS into CommonJS
                    "sass-loader"   // compiles Sass to CSS, using Node Sass by default
                ]
            }
        ]
    }
};
