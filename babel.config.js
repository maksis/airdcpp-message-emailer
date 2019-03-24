module.exports = function (api) {
  api.cache(true);

  const presets = [ 
    ["@babel/env", {
      "targets": {
        "node": "0.10"
      }
    }]
  ];

  const plugins = [
    "@babel/plugin-transform-async-to-generator",
    "array-includes",
    ["@babel/plugin-transform-runtime", {
      "regenerator": true
    }]
  ];

  return {
    presets,
    plugins
  }
}
