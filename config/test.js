const jest = require('jest')
const argv = process.argv.slice(2)

process.env.BABEL_ENV = 'test'
process.env.NODE_ENV = 'test'
process.env.PUBLIC_URL = ''

jest.run(argv)
