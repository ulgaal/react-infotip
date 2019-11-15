module.exports = function (api) {
  console.log('BABEL.config', api)
  return {
    presets: [
      '@babel/preset-react',
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage'
        }
      ]
    ]
  }
}
