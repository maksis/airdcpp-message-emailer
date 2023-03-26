module.exports = function (api) {
  api.cache(true);

  const presets = [ 
    ["@babel/env", {
      "targets": {
        "node": "12.0"
      }
    }]
  ];

  const plugins = [];

  return {
    presets,
    plugins
  }
}
