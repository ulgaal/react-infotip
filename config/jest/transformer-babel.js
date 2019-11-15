const { createTransformer } = require('babel-jest')
const babelConfig = require('../babel/config')
module.exports = createTransformer(babelConfig())
