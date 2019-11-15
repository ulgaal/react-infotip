const path = require('path')

// Export a function. Accept the base config as the only param.
module.exports = async ({ config, mode }) => {
  // Use svg react loader for svg files
  const imgRule = config.module.rules.find(({ test }) => {
    return (
      test.source ===
      '\\.(svg|ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\\?.*)?$'
    )
  })
  imgRule.test = /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/
  config.module.rules.push({
    test: /\.svg$/,
    loader: 'svg-react-loader'
  })

  // Enable storysource addon to load source code
  config.module.rules.push({
    test: /\.stories\.jsx?$/,
    loaders: [require.resolve('@storybook/source-loader')],
    enforce: 'pre'
  })

  // Return the altered config
  return config
}
