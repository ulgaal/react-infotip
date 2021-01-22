const path = require('path')

// Export a function. Accept the base config as the only param.
module.exports = async ({ config, mode }) => {
  // Use svg react loader for svg files
  const imgRule = config.module.rules.find(({ test }) => {
    return (
      test.source ===
      '\\.(svg|ico|jpg|jpeg|png|apng|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\\?.*)?$'
    )
  })
  imgRule.test = /\.(ico|jpg|jpeg|png|apng|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/
  config.module.rules.push({
    test: /\.svg$/,
    loader: 'svg-react-loader'
  })

  // Return the altered config
  return config
}
