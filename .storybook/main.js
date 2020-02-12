module.exports = {
  addons: [
    '@storybook/addon-actions/register',
    '@storybook/addon-knobs/register',
    '@storybook/addon-links/register',
    '@storybook/addon-storysource',
    'storybook-readme/register'
  ],
  stories: ['../stories/*.stories.[tj]s']
}
