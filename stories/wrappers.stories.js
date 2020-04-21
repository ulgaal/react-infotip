/*
Copyright 2019 Ulrich Gaal

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React from 'react'

import { storiesOf } from '@storybook/react'
// import { linkTo } from '@storybook/addon-links'
// import { Welcome } from '@storybook/react/demo'
import { withKnobs } from '@storybook/addon-knobs'
import { addReadme } from 'storybook-readme'

import {
  Balloon,
  Cloud,
  Pinnable,
  ConfigContext,
  styles,
  MergingConfigProvider
} from '../src'

import {
  balloonDecorator,
  cloudDecorator,
  styleDecorator,
  wrapperDecorator,
  pinDecorator,
  positionDecorator
} from './decorators'

import BalloonReadme from './md/wrappers/balloon.md'
import StyleReadme from './md/wrappers/style.md'
import ConfigContextReadme from './md/wrappers/context.md'
import MiscReadme from './md/wrappers/misc.md'
import CloudReadme from './md/wrappers/cloud.md'
import PinnableReadme from './md/wrappers/pinnable.md'
import docgen from './docgen'
import { generateMarkdown } from './generateMarkdown'

import Guitar from './guitar.svg'

import './wrappers.stories.css'

const BalloonRefReadme = generateMarkdown(
  'Balloon',
  docgen['src/Balloon.js'][0]
)
const CloudRefReadme = generateMarkdown('Cloud', docgen['src/Cloud.js'][0])
const PinnableRefReadme = generateMarkdown(
  'Pinnable',
  docgen['src/Pinnable.js'][0]
)

storiesOf('Wrappers', module)
  .addDecorator(addReadme)
  .addParameters({ options: { theme: {} } })
  .addDecorator(withKnobs)
  .add(
    'Balloon wrapper',
    () => (
      <ConfigContext.Consumer>
        {({ position: { my }, wrapperProps }) => (
          <Balloon my={my} {...wrapperProps}>
            A balloon
          </Balloon>
        )}
      </ConfigContext.Consumer>
    ),
    {
      readme: {
        content: BalloonReadme,
        sidebar: BalloonRefReadme
      },
      decorators: [styleDecorator, positionDecorator, balloonDecorator]
    }
  )
  .add(
    'Cloud wrapper',
    () => (
      <ConfigContext.Consumer>
        {({ position: { my }, wrapperProps }) => (
          <span style={{ display: 'inline-block', position: 'relative' }}>
            <Cloud my={my} {...wrapperProps}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '5px 10px 5px 10px'
                }}
              >
                A cloud
              </span>
            </Cloud>
          </span>
        )}
      </ConfigContext.Consumer>
    ),
    {
      readme: {
        content: CloudReadme,
        sidebar: CloudRefReadme
      },
      decorators: [styleDecorator, positionDecorator, cloudDecorator]
    }
  )
  .add(
    'Styled wrapper',
    () => (
      <ConfigContext.Consumer>
        {({ position: { my }, wrapperProps }) => (
          <span style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Balloon
              my={my}
              {...wrapperProps}
              style={{
                padding: '4px 10px 4px 10px',
                color: '#454545',
                backgroundColor: 'white',
                border: '1px solid #E2E2E2',
                borderRadius: '4px',
                boxShadow: '3px 3px #ddd'
              }}
            >
              Light
            </Balloon>
            <Balloon my={my} {...wrapperProps} className='dark-style'>
              Dark
            </Balloon>
          </span>
        )}
      </ConfigContext.Consumer>
    ),
    {
      readme: {
        content: StyleReadme,
        sidebar: BalloonRefReadme
      },
      decorators: [styleDecorator, positionDecorator, balloonDecorator]
    }
  )
  .add(
    'Global style customization',
    () => (
      <span style={{ display: 'flex', justifyContent: 'space-around' }}>
        <MergingConfigProvider
          value={{ wrapperProps: { style: styles.redStyle } }}
        >
          <ConfigContext.Consumer>
            {({ position: { my }, wrapperProps }) => (
              <>
                <Balloon my={my} {...wrapperProps}>
                  We
                </Balloon>
                <Balloon my={my} {...wrapperProps}>
                  prefer
                </Balloon>
                <Balloon my={my} {...wrapperProps}>
                  red
                </Balloon>
              </>
            )}
          </ConfigContext.Consumer>
        </MergingConfigProvider>
        <MergingConfigProvider
          value={{ wrapperProps: { className: 'green-style' } }}
        >
          <ConfigContext.Consumer>
            {({ position: { my }, wrapperProps }) => (
              <>
                <Balloon my={my} {...wrapperProps}>
                  We
                </Balloon>
                <Balloon my={my} {...wrapperProps}>
                  prefer
                </Balloon>
                <Balloon my={my} {...wrapperProps}>
                  green
                </Balloon>
              </>
            )}
          </ConfigContext.Consumer>
        </MergingConfigProvider>
      </span>
    ),
    {
      readme: {
        content: ConfigContextReadme,
        sidebar: BalloonRefReadme
      },
      decorators: [styleDecorator, positionDecorator, balloonDecorator]
    }
  )
  .add(
    'Miscellaneous wrapper contents',
    () => (
      <ConfigContext.Consumer>
        {({ position: { my }, wrapper: Wrapper, wrapperProps }) => (
          <span style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Wrapper my={my} {...wrapperProps} style={styles.blueStyle}>
              <Guitar width='120px' height='50px' />
            </Wrapper>
            <Wrapper
              my={my}
              {...wrapperProps}
              style={{
                border: '2px solid #3d562c',
                backgroundColor: '#4d774a',
                borderRadius: '4px',
                padding: '4px 4px 0px 4px'
              }}
            >
              <video width={250} loop autoplay=''>
                <source
                  src='https://interactive-examples.mdn.mozilla.net/media/examples/flower.webm'
                  type='video/webm'
                />
                <source
                  src='https://interactive-examples.mdn.mozilla.net/media/examples/flower.mp4'
                  type='video/mp4'
                />
                Sorry, your browser doesn't support embedded videos.
              </video>
            </Wrapper>
            <Wrapper
              my={my}
              {...wrapperProps}
              style={{
                background:
                  'linear-gradient(to bottom, #f8ffe8 0%,#e3f5ab 33%,#b7df2d 100%)',
                border: '2px dotted black'
              }}
            >
              <table className='bubble-table'>
                <thead>
                  <tr>
                    <th colSpan={2}>Numbers and spelling</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>One</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Two</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Three</td>
                  </tr>
                </tbody>
              </table>
            </Wrapper>
            <Wrapper my={my} {...wrapperProps} style={styles.redStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button style={{ flexGrow: 1 }}>Tic</button>
                <button style={{ flexGrow: 1 }}>Tac</button>
              </div>
            </Wrapper>
          </span>
        )}
      </ConfigContext.Consumer>
    ),
    {
      readme: {
        content: MiscReadme,
        sidebar: BalloonRefReadme
      },
      decorators: [styleDecorator, positionDecorator, wrapperDecorator]
    }
  )
  .add(
    'Pinnable wrapper',
    () => (
      <ConfigContext.Consumer>
        {({ wrapper, wrapperProps }) => {
          return (
            <span style={{ display: 'flex', justifyContent: 'space-around' }}>
              <Pinnable
                wrapper={wrapper}
                {...wrapperProps}
                pinned={wrapperProps.pinned}
              >
                <div>Pinnable</div>
              </Pinnable>
              <Pinnable
                wrapper={wrapper}
                {...wrapperProps}
                pinned={wrapperProps.pinned}
                className='dark-style'
              >
                <div>Pinnable</div>
              </Pinnable>
            </span>
          )
        }}
      </ConfigContext.Consumer>
    ),
    {
      readme: {
        content: PinnableReadme,
        sidebar: PinnableRefReadme
      },
      decorators: [
        styleDecorator,
        positionDecorator,
        wrapperDecorator,
        pinDecorator
      ]
    }
  )
