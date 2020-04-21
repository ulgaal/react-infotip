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
import React, { useMemo, useState, useEffect, useRef } from 'react'

import { storiesOf } from '@storybook/react'
// import { linkTo } from '@storybook/addon-links'
// import { Welcome } from '@storybook/react/demo'
import { withKnobs } from '@storybook/addon-knobs'
import { addReadme } from 'storybook-readme'

import Rocket from './rocket.svg'

import {
  Source,
  Cloud,
  MergingConfigProvider,
  ConfigContext,
  seq
} from '../src'

import './tooltips.stories.css'

import DefaultReadme from './md/source/default.md'
import UlReadme from './md/source/ul.md'
import PinnedReadme from './md/source/pinned.md'
import WrapperReadme from './md/source/cloud.md'
import AsyncReadme from './md/source/async.md'
import ContainersReadme from './md/source/containers.md'
import TargetReadme from './md/source/target.md'
import MouseTargetReadme from './md/source/mouse-target.md'
import SvgReadme from './md/source/svg.md'
import ConfigReadme from './md/source/config.md'
import ConfigContextReadme from './md/source/config-context.md'
import AdjustReadme from './md/source/adjust.md'
import FunctionAdjustReadme from './md/source/adjust-function.md'
import BicolorReadme from './md/source/bicolor.md'

import { styleDecorator, layoutDecorator, wrapperDecorator } from './decorators'
import docgen from './docgen'
import { generateMarkdown } from './generateMarkdown'
const SourceReadme = generateMarkdown('Source', docgen['src/Source.js'][0])

storiesOf('Tooltips', module)
  .addDecorator(addReadme)
  .addParameters({ options: { theme: {} } })
  .addDecorator(withKnobs)
  .addDecorator(styleDecorator)
  .addDecorator(wrapperDecorator)
  .addDecorator(layoutDecorator)
  .add(
    'Default Source',
    () => (
      <span style={{ display: 'flex' }}>
        <Source tip='Default tip'>
          <span className='default-rect'>I use the default tip</span>
        </Source>
      </span>
    ),
    {
      readme: {
        content: DefaultReadme,
        sidebar: SourceReadme
      }
    }
  )
  .add(
    'Configured Source',
    () => (
      <span style={{ display: 'flex' }}>
        <Source
          tip='Configured tip'
          config={{ position: { at: 'bottom-center' } }}
        >
          <span className='default-rect'>My tip appears at bottom-center</span>
        </Source>
      </span>
    ),
    {
      readme: {
        content: ConfigReadme,
        sidebar: SourceReadme
      }
    }
  )
  .add(
    'Global config customization',
    () => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ display: 'flex' }}>
          <MergingConfigProvider
            value={{
              hide: { delay: 500 },
              position: { my: 'bottom-left', at: 'top-right' }
            }}
          >
            {'Our tips hide after 500 milliseconds'
              .split(' ')
              .map((txt, index) => (
                <Source key={index} tip='I do not want to go away'>
                  <span
                    className='default-rect'
                    style={{ backgroundColor: 'lightgreen' }}
                  >
                    {txt}
                  </span>
                </Source>
              ))}
          </MergingConfigProvider>
        </span>
        <span style={{ display: 'flex' }}>
          <MergingConfigProvider value={{ hide: { delay: 2000 } }}>
            {'Our tips hide after 2 seconds'.split(' ').map((txt, index) => (
              <Source key={index} tip='I do not want to go away'>
                <span className='default-rect'>{txt}</span>
              </Source>
            ))}
          </MergingConfigProvider>
        </span>
      </div>
    ),
    {
      readme: {
        content: ConfigContextReadme,
        sidebar: SourceReadme
      }
    }
  )
  .add(
    'Custom wrapper',
    () => (
      <Source tip='This is a cloud tip' config={{ wrapper: Cloud }}>
        <span className='default-rect centered-rect'>I have a cloud tip</span>
      </Source>
    ),
    {
      readme: {
        content: WrapperReadme,
        sidebar: SourceReadme
      }
    }
  )
  .add(
    'Force tip display',
    () => (
      <Source tip='I am the tip' pinned>
        <span className='default-rect centered-rect'>
          My tip is visible by default
        </span>
      </Source>
    ),
    {
      readme: {
        content: PinnedReadme,
        sidebar: SourceReadme
      }
    }
  )
  .add(
    'Use of display:contents',
    () => (
      <span className='centered-rect'>
        <ul>
          <Source tip='One'>
            <li>Item 1</li>
          </Source>
          <Source tip='Two'>
            <li>Item 2</li>
          </Source>
          <Source tip='Three'>
            <li>Item 3</li>
          </Source>
        </ul>
      </span>
    ),
    {
      readme: {
        content: UlReadme,
        sidebar: SourceReadme
      }
    }
  )
  .add(
    'Async tips',
    () => {
      const DynamicTip = () => {
        const [countdown, setCountdown] = useState(5)
        useEffect(() => {
          if (countdown > 0) {
            const timeoutID = setTimeout(() => {
              setCountdown(countdown - 1)
            }, 500)
            return () => {
              clearTimeout(timeoutID)
            }
          }
        })
        return countdown > 0 ? (
          <span>{`... ${countdown} ...`}</span>
        ) : (
          <Rocket width='150px' height='150px' />
        )
      }
      return (
        <MergingConfigProvider value={{ hide: { delay: 300 } }}>
          <Source tip={<DynamicTip />}>
            <span className='default-rect centered-rect'>
              My tip appears asynchronously
            </span>
          </Source>
        </MergingConfigProvider>
      )
    },
    {
      readme: {
        content: AsyncReadme,
        sidebar: SourceReadme
      }
    }
  )
  .add(
    'Tip containers',
    () => (
      <div
        id='green-div'
        style={{
          backgroundColor: 'lightgreen',
          padding: '50px 70px',
          position: 'relative'
        }}
      >
        <MergingConfigProvider
          value={{
            position: {
              my: 'top-center',
              at: 'bottom-center'
            }
          }}
        >
          <Source tip='My parent is the document body'>
            <span className='default-rect'>
              My tip attaches to the default container(body)
            </span>
          </Source>
          <MergingConfigProvider
            value={{
              position: {
                container: '#green-div'
              }
            }}
          >
            <Source tip='My parent is the green div'>
              <span className='default-rect'>
                My tip attaches to a container specified with a CSS selector
              </span>
            </Source>
          </MergingConfigProvider>
        </MergingConfigProvider>
      </div>
    ),
    {
      readme: {
        content: ContainersReadme,
        sidebar: SourceReadme
      }
    }
  )
  .add(
    'Position target customization',
    () => (
      <div
        style={{
          display: 'flex'
        }}
      >
        <span className='custom-target'>Target</span>
        <MergingConfigProvider
          value={{
            position: {
              my: 'top-center',
              at: 'bottom-center',
              target: '.custom-target'
            }
          }}
        >
          {'Our tips have a target specified by a CSS selector'
            .split(/\s/)
            .map((i, index) => (
              <Source key={index} tip={i}>
                <span className='default-rect' key={i}>
                  {i}
                </span>
              </Source>
            ))}
        </MergingConfigProvider>
      </div>
    ),
    {
      readme: {
        content: TargetReadme,
        sidebar: SourceReadme
      }
    }
  )
  .add(
    'Mouse target',
    () => (
      <MergingConfigProvider
        value={{
          position: {
            target: 'mouse'
          }
        }}
      >
        <Source tip='Ouch !'>
          <span
            className='default-rect'
            style={{ width: '300px', height: '200px' }}
          >
            Hit me with a mouse
          </span>
        </Source>
      </MergingConfigProvider>
    ),
    {
      readme: {
        content: MouseTargetReadme,
        sidebar: SourceReadme
      }
    }
  )
  .add(
    'SVG source',
    () => (
      <svg width='600px' height='300px' style={{ border: '1px dotted black' }}>
        <Source svg tip='I am a rect'>
          <rect
            fill='green'
            stroke='black'
            x='10'
            y='100'
            width='100px'
            height='100px'
          />
        </Source>
        <Source svg tip='I am a circle'>
          <circle fill='red' stroke='black' cx='300' cy='200' r='50' />
        </Source>
        <Source svg tip='I am a star'>
          <path
            transform='translate(400, 100) scale(2, 2)'
            fill='yellow'
            stroke='black'
            d='m25,1 6,17h18l-14,11 5,17-15-10-15,10 5-17-14-11h18z'
          />
        </Source>
      </svg>
    ),
    {
      readme: {
        content: SvgReadme,
        sidebar: SourceReadme
      }
    }
  )
  .add(
    'Position adjust configuration',
    () => (
      <span style={{ display: 'flex' }}>
        <MergingConfigProvider
          value={{
            position: {
              my: 'center-right',
              adjust: {
                mouse: true
              }
            }
          }}
        >
          <div className='adjust-container none'>
            <MergingConfigProvider
              value={{
                position: {
                  container: '.adjust-container.none'
                }
              }}
            >
              <Source
                tip={
                  <span>
                    I have no
                    <br />
                    ajust method
                  </span>
                }
              >
                <span className='adjust none'>Ajust none</span>
              </Source>
            </MergingConfigProvider>
          </div>
          <div className='adjust-container flip'>
            <MergingConfigProvider
              value={{
                position: {
                  container: '.adjust-container.flip',
                  adjust: {
                    method: {
                      flip: [
                        'center-left',
                        'center-right',
                        'top-center',
                        'bottom-center'
                      ]
                    }
                  }
                }
              }}
            >
              <Source
                tip={
                  <span>
                    I use a flip
                    <br />
                    ajust method
                  </span>
                }
              >
                <span className='adjust flip'>Ajust flip</span>
              </Source>
            </MergingConfigProvider>
          </div>
          <div className='adjust-container shift'>
            <MergingConfigProvider
              value={{
                position: {
                  container: '.adjust-container.shift',
                  adjust: {
                    method: {
                      shift: ['horizontal', 'vertical']
                    }
                  }
                }
              }}
            >
              <Source
                tip={
                  <span>
                    I use a shift
                    <br />
                    ajust method
                  </span>
                }
              >
                <span className='adjust shift'>Ajust shift</span>
              </Source>
            </MergingConfigProvider>
          </div>
        </MergingConfigProvider>
      </span>
    ),
    {
      readme: {
        content: AdjustReadme,
        sidebar: SourceReadme
      }
    }
  )
  .add(
    'Function based adjust',
    () => {
      const W = 600
      const H = 200
      const count = 100
      const points = [...seq(0, count)].map(x => ({
        x: (W * x) / count,
        y: H * (0.2 + Math.random() * 0.6)
      }))
      const Graph = () => {
        const ref = useRef()
        const [position, setPosition] = useState({ x: 0, y: 0 })
        const config = useMemo(
          () => ({
            position: {
              adjust: {
                mouse: position => {
                  const rect = ref.current
                  const ctm = rect.getScreenCTM()
                  const pos = rect.ownerSVGElement.createSVGPoint()
                  pos.x = position.x
                  pos.y = position.y
                  const pos2 = pos.matrixTransform(ctm.inverse())
                  const x = Math.max(
                    0,
                    Math.min(Math.floor((pos2.x * count) / W), count - 1)
                  )
                  const y = Math.round(points[x].y)
                  Promise.resolve().then(() => {
                    // Update position asynchonously since one cannot
                    // update Graph when rendering tooltip
                    // https://fb.me/setstate-in-render
                    setPosition({ x, y })
                  })
                  return {
                    x: position.x + window.scrollX,
                    y: ctm.f + y + window.scrollY
                  }
                }
              }
            }
          }),
          []
        )
        return (
          <MergingConfigProvider value={config}>
            <svg
              width='600px'
              height='200px'
              style={{ border: '1px dotted black' }}
            >
              <Source
                svg
                tip={
                  <span>
                    x={position.x}
                    <br />
                    y={position.y}
                  </span>
                }
              >
                <rect
                  x={0}
                  y={0}
                  width={600}
                  height={200}
                  style={{ fill: 'white', stroke: 'none' }}
                  ref={ref}
                />
                <path
                  style={{ stroke: 'black', fill: 'none' }}
                  d={points
                    .map(({ x, y }, index) => `${index ? 'L' : 'M'} ${x},${y}`)
                    .join(' ')}
                />
              </Source>
            </svg>
          </MergingConfigProvider>
        )
      }

      return <Graph />
    },
    {
      readme: {
        content: FunctionAdjustReadme,
        sidebar: SourceReadme
      }
    }
  )
  .add(
    'Qtip2-like bi-color tips',
    () => {
      const bicolorStyles = [
        {
          title: 'Default',
          description: 'Default yellow style',
          borderColor: '#F1D031',
          descriptionColor: '#FFFFA3',
          titleColor: '#FFEF93',
          textColor: '#444'
        },
        {
          title: 'Light',
          description: 'Light style, for the minimalists',
          borderColor: '#E2E2E2',
          descriptionColor: 'white',
          titleColor: '#f1f1f1',
          textColor: '#454545'
        },
        {
          title: 'Dark',
          description: 'An opposing dark style',
          borderColor: '#303030',
          descriptionColor: '#505050',
          titleColor: '#404040',
          textColor: '#f3f3f3'
        },
        {
          title: 'Red',
          description: 'Great for error related messages',
          borderColor: '#D95252',
          descriptionColor: '#F78B83',
          titleColor: '#F06D65',
          textColor: '#912323'
        },
        {
          title: 'Blue',
          description: 'Placid blue, for those informative messages',
          borderColor: '#ADD9ED',
          descriptionColor: '#E5F6FE',
          titleColor: '#D0E9F5',
          textColor: '#5E99BD'
        },
        {
          title: 'Green',
          description: 'A generic but tasteful green style',
          borderColor: '#90D93F',
          descriptionColor: '#CAED9E',
          titleColor: '#B0DE78',
          textColor: '#3F6219'
        }
      ]

      const BicolorStyle = ({ value, icon }) => {
        const {
          title,
          description,
          titleColor,
          descriptionColor,
          textColor,
          borderColor
        } = value
        return (
          <ConfigContext.Consumer>
            {({
              wrapperProps: {
                style: { borderRadius, boxShadow }
              }
            }) => (
              <span className='bicolor-tip'>
                <span
                  className='bicolor-header'
                  style={{
                    color: textColor,
                    backgroundColor: titleColor,
                    boxShadow,
                    borderTopLeftRadius: borderRadius,
                    borderTopRightRadius: borderRadius,
                    ...(icon
                      ? {
                          borderTop: `1px solid ${borderColor}`,
                          borderLeft: `1px solid ${borderColor}`,
                          borderRight: `1px solid ${borderColor}`
                        }
                      : {})
                  }}
                >
                  {icon ? null : title}
                </span>
                <span
                  className='bicolor-body'
                  style={{
                    color: textColor,
                    backgroundColor: descriptionColor,
                    boxShadow,
                    borderBottomLeftRadius: borderRadius,
                    borderBottomRightRadius: borderRadius,
                    ...(icon
                      ? {
                          borderBottom: `1px solid ${borderColor}`,
                          borderLeft: `1px solid ${borderColor}`,
                          borderRight: `1px solid ${borderColor}`
                        }
                      : {})
                  }}
                >
                  {icon ? null : description}
                </span>
              </span>
            )}
          </ConfigContext.Consumer>
        )
      }

      return (
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <MergingConfigProvider
            value={{
              position: {
                adjust: {
                  x: -15,
                  y: -15
                }
              }
            }}
          >
            {bicolorStyles.map((bicolorStyle, i) => (
              <ConfigContext.Consumer key={i}>
                {({
                  wrapperProps: {
                    style: { borderRadius, boxShadow }
                  }
                }) => (
                  <MergingConfigProvider
                    value={{
                      wrapperProps: {
                        style: {
                          border: `1px solid ${bicolorStyle.borderColor}`,
                          backgroundColor: bicolorStyle.titleColor,
                          borderRadius,
                          boxShadow,
                          padding: '0 0'
                        }
                      }
                    }}
                  >
                    <Source tip={<BicolorStyle value={bicolorStyle} />}>
                      <BicolorStyle value={bicolorStyle} icon />
                    </Source>
                  </MergingConfigProvider>
                )}
              </ConfigContext.Consumer>
            ))}
          </MergingConfigProvider>
        </div>
      )
    },
    {
      readme: {
        content: BicolorReadme,
        sidebar: SourceReadme
      }
    }
  )
