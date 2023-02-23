module.exports = {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            rhino: "1.7.0",
          }
        }
      ]
    ],
    //plugins: ["@babel/plugin-proposal-async-generator-functions"]
  }