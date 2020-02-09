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
import {
  MergingConfigProvider,
  styles,
  positions,
  Balloon,
  Cloud
} from '../src'
import { object, select, boolean, number } from '@storybook/addon-knobs'

export const positions_ = positions.reduce((positions, value) => {
  positions[value] = value
  return positions
}, {})

export const STYLE_GROUP = 'Style'
export const LAYOUT_GROUP = 'Layout'
export const POSITION_GROUP = 'Position'
export const GEOMETRY_GROUP = 'Geometry'
export const WRAPPER_GROUP = 'Wrapper'

export const WrapperContext = React.createContext(Balloon)

export const wrapperDecorator = story => {
  const wrappers = {
    Balloon: {
      wrapper: Balloon,
      decorator: balloonDecorator
    },
    Cloud: {
      wrapper: Cloud,
      decorator: cloudDecorator
    }
  }
  const wrapperName = select(
    'Wrapper type',
    {
      Balloon: 'Balloon',
      Cloud: 'Cloud'
    },
    'Balloon',
    WRAPPER_GROUP
  )

  return (
    <div>
      <WrapperContext.Provider value={wrappers[wrapperName].wrapper}>
        <MergingConfigProvider
          value={{
            wrapper: wrappers[wrapperName].wrapper
          }}
        >
          {wrappers[wrapperName].decorator(story)}
        </MergingConfigProvider>
      </WrapperContext.Provider>
    </div>
  )
}

export const balloonDecorator = story => {
  const wrapperProps = {
    tail: {
      width: number(
        'Tail width',
        8,
        {
          range: true,
          min: 0,
          max: 30,
          step: 1
        },
        WRAPPER_GROUP
      ),
      height: number(
        'Tail height',
        8,
        {
          range: true,
          min: 0,
          max: 30,
          step: 1
        },
        WRAPPER_GROUP
      )
    }
  }
  return (
    <MergingConfigProvider
      value={{
        wrapperProps
      }}
    >
      {story()}
    </MergingConfigProvider>
  )
}

export const cloudDecorator = story => {
  const wrapperProps = {
    tail: {
      width: number(
        'Tail width',
        25,
        {
          range: true,
          min: 0,
          max: 50,
          step: 1
        },
        WRAPPER_GROUP
      ),
      height: number(
        'Tail height',
        25,
        {
          range: true,
          min: 0,
          max: 50,
          step: 1
        },
        WRAPPER_GROUP
      )
    },
    folds: number(
      'Number of cloud folds',
      13,
      {
        range: true,
        min: 5,
        max: 50,
        step: 1
      },
      WRAPPER_GROUP
    )
  }
  return (
    <WrapperContext.Provider value={Cloud}>
      <MergingConfigProvider
        value={{
          wrapperProps
        }}
      >
        {story()}
      </MergingConfigProvider>
    </WrapperContext.Provider>
  )
}

export const styleDecorator = story => (
  <div>
    <MergingConfigProvider
      value={{
        wrapperProps: {
          style:
            select(
              'Predefined styles',
              {
                'Default style': styles.defaultStyle,
                'Light style': styles.lightStyle,
                'Dark style': styles.darkStyle,
                'Red style': styles.redStyle,
                'Green style': styles.greenStyle,
                'Blue style': styles.blueStyle,
                'Custom style': null
              },
              styles.defaultStyle,
              STYLE_GROUP
            ) ||
            object(
              'Custom style',
              {
                margin: '0 0 0 0',
                padding: '4px 10px 4px 10px',
                color: '#444',
                backgroundColor: '#FFFFA3',
                border: '1px solid #F1D031',
                borderRadius: '4px',
                boxShadow: '3px 3px #ddd',
                whiteSpace: 'nowrap'
              },
              STYLE_GROUP
            )
        }
      }}
    >
      <WrapperContext.Consumer>
        {wrapper => {
          return (
            <MergingConfigProvider
              value={{
                wrapperProps: {
                  style: {
                    ...(wrapper === Balloon
                      ? {
                          borderRadius: boolean('Rounded', false, STYLE_GROUP)
                            ? '4px'
                            : '0'
                        }
                      : {}),
                    boxShadow: boolean('Shadow', false, STYLE_GROUP)
                      ? '3px 3px #ddd'
                      : 'none'
                  }
                }
              }}
            >
              {story()}
            </MergingConfigProvider>
          )
        }}
      </WrapperContext.Consumer>
    </MergingConfigProvider>
  </div>
)

export const layoutDecorator = story => (
  <div>
    <MergingConfigProvider
      value={{
        position: {
          my: select('My', positions_, 'top-left', LAYOUT_GROUP),
          at: select('At', positions_, 'bottom-right', LAYOUT_GROUP)
        }
      }}
    >
      {story()}
    </MergingConfigProvider>
  </div>
)

export const positionDecorator = story => (
  <div>
    <MergingConfigProvider
      value={{
        position: {
          my: select('My', positions_, 'top-left', POSITION_GROUP)
        }
      }}
    >
      {story()}
    </MergingConfigProvider>
  </div>
)

export const pinDecorator = story => (
  <div>
    <MergingConfigProvider
      value={{
        wrapperProps: {
          pinned: boolean('Pinned', true, WRAPPER_GROUP)
        }
      }}
    >
      {story()}
    </MergingConfigProvider>
  </div>
)
