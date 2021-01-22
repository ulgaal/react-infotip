import React from 'react'
import { configureReadme } from 'storybook-readme'

configureReadme({
  StoryPreview: ({ children }) => (
    <div className='storybook-readme-content'>{children}</div>
  )
})
