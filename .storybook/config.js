import React from 'react'
import { addDecorator, configure } from '@storybook/react'
import { addReadme, configureReadme } from 'storybook-readme'

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /.stories.js$/)
function loadStories() {
  req.keys().forEach(filename => req(filename))
}

configureReadme({
  StoryPreview: ({ children }) => (
    <div className='storybook-readme-content'>{children}</div>
  )
})

addDecorator(addReadme)

configure(loadStories, module)
