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
import React, {
  useState,
  useContext,
  useRef,
  useMemo,
  useReducer,
  useEffect
} from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'
import { addReadme } from 'storybook-readme'

import {
  Source,
  Storage,
  Pinnable,
  MergingConfigProvider,
  ConfigContext,
  seq
} from '../src'

import PersistentReadme from './md/storage/persistent.md'
import TableReadme from './md/storage/table.md'
import MultiLineChartReadme from './md/storage/multi-line-chart.md'
import docgen from './docgen'
import { generateMarkdown } from './generateMarkdown'

import {
  styleDecorator,
  wrapperDecorator,
  layoutDecorator,
  WrapperContext
} from './decorators'

import './sticky-notes.stories.css'
import faker from 'faker'
import {
  Table,
  TableDispatch,
  COLUMN_REORDERING,
  COLUMN_RESIZING,
  PAGING
} from 'react-reducer-table'

const StorageReadme = generateMarkdown('Storage', docgen['src/Storage.js'][0])

storiesOf('Sticky-notes', module)
  .addDecorator(addReadme)
  .addParameters({ options: { theme: {} } })
  .addDecorator(withKnobs)
  .addDecorator(styleDecorator)
  .addDecorator(wrapperDecorator)
  .addDecorator(layoutDecorator)
  .add(
    'Pinnable, persistent sticky-notes',
    () => {
      const models = [...seq(1, 5)].map(id => ({
        id: `tip-${id}`,
        label: `box #${id}`
      }))
      let storedTips = []
      try {
        const item = window.localStorage.getItem('persistent-tips')
        if (item) {
          storedTips = JSON.parse(item)
        }
      } catch (err) {
        console.log(err)
      }
      const PersistentContainer = () => {
        const config = useContext(ConfigContext)
        const wrapper = useContext(WrapperContext)
        const [pinnedTips, setPinnedTips] = useState(() => {
          return storedTips.map(tip => {
            const { config } = tip
            config.wrapper = Pinnable
            config.wrapperProps = { ...config.wrapperProps, wrapper }
            return tip
          })
        })
        const persistTips = tips => {
          setPinnedTips(tips)
          try {
            window.localStorage.setItem('persistent-tips', JSON.stringify(tips))
          } catch (err) {
            console.log(err)
          }
        }
        return (
          <div style={{ height: '250px' }}>
            <MergingConfigProvider
              value={{
                show: {
                  delay: 105
                },
                hide: {
                  delay: 100
                },
                wrapper: Pinnable,
                wrapperProps: { wrapper: config.wrapper }
              }}
            >
              <Storage
                tips={pinnedTips}
                tip={(id, pinned) => (
                  <div key={id} className='storable-tip'>
                    <span>
                      {`Tip for ${models.find(model => model.id === id).label}`}
                    </span>
                    <br />
                    {pinned ? (
                      <span>
                        I persist if you reload page. You can unpin me
                      </span>
                    ) : (
                      <span>You can drag and pin me</span>
                    )}
                  </div>
                )}
                onTipChange={persistTips}
              >
                <div style={{ display: 'flex' }} className='centered-rect'>
                  {models.map(({ id, label }, i) => (
                    <Source key={i} id={id}>
                      <span className='default-rect'>{label}</span>
                    </Source>
                  ))}
                </div>
              </Storage>
            </MergingConfigProvider>
          </div>
        )
      }
      return <PersistentContainer models={models} />
    },
    {
      readme: {
        content: PersistentReadme,
        sidebar: StorageReadme
      }
    }
  )
  .add(
    'Table sticky-notes',
    () => {
      const { helpers, internet, commerce } = faker
      const models = [...seq(0, 200)].map(id => ({
        id,
        ...helpers.userCard(),
        image: internet.avatar(),
        products: [...seq(0, 1 + Math.floor(20 * Math.random()))].map(
          productId => ({
            id: `${id}-${productId}`,
            color: commerce.color(),
            department: commerce.department(),
            productName: commerce.productName(),
            price: commerce.price(),
            product: commerce.product()
          })
        )
      }))
      const tableReducer = (state, action) => {
        const { columns } = state
        const { type, pageIndex, pageSize } = action
        switch (action.type) {
          case PAGING: {
            const total = models.length
            return {
              ...state,
              pageSize,
              pageIndex,
              pageCount:
                Math.floor(total / pageSize) + (total % pageSize ? 1 : 0),
              total,
              data: models.slice(
                pageIndex * pageSize,
                Math.min((pageIndex + 1) * pageSize, total)
              )
            }
          }
          case COLUMN_REORDERING:
            return { ...state, columns: action.columns }
          case COLUMN_RESIZING:
            return {
              ...state,
              columns: columns.map(column =>
                column.id === action.id
                  ? { ...column, width: action.width }
                  : column
              )
            }
          default:
            throw new Error(`Unknown action: ${type}`)
        }
      }

      const NameCell = props => {
        const {
          row: { id, name }
        } = props
        return (
          <Source id={`sel@${id}`}>
            <div className='seller-tip-source'>{name}</div>
          </Source>
        )
      }
      const ProductsCell = props => {
        const {
          row: { products }
        } = props
        return (
          <div className='products'>
            {products.map((product, id) => {
              return <Product key={id} product={product} />
            })}
          </div>
        )
      }
      const Product = props => {
        // console.log('Product', props)
        const {
          product: { id, color, product }
        } = props
        return (
          <Source id={`prd@${id}`}>
            <div className='product' style={{ backgroundColor: color }}>
              {product}
            </div>
          </Source>
        )
      }

      const SellerTip = props => {
        const {
          model: {
            name,
            username,
            email,
            phone,
            company,
            address: { street, suite, city, zipcode },
            image
          }
        } = props
        return (
          <div className='seller-tip'>
            <table>
              <tbody>
                <tr>
                  <td className='seller-tip-key'>Name:</td>
                  <td>{name}</td>
                  <td rowSpan={5}>
                    <img className='seller-tip-image' src={image} />
                  </td>
                </tr>
                <tr>
                  <td className='seller-tip-key'>User Name:</td>
                  <td>{username}</td>
                </tr>
                <tr>
                  <td className='seller-tip-key'>Email:</td>
                  <td>{email}</td>
                </tr>
                <tr>
                  <td className='seller-tip-key'>Phone:</td>
                  <td>{phone}</td>
                </tr>
                <tr>
                  <td className='seller-tip-key'>Company:</td>
                  <td>{company.name}</td>
                </tr>
                <tr>
                  <td className='seller-tip-key'>Address:</td>
                  <td colSpan={2}>
                    {suite}
                    <br />
                    {street}
                    <br />
                    {zipcode} {city}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      }

      const ProductTip = props => {
        // console.log('ProductTip', props)
        const {
          product: { department, price, product, productName, color }
        } = props
        return (
          <div className='product-tip'>
            <table>
              <tbody>
                <tr>
                  <td>Department:</td>
                  <td>{department}</td>
                </tr>
                <tr>
                  <td>Product name:</td>
                  <td>{productName}</td>
                </tr>
                <tr>
                  <td>Product:</td>
                  <td>{product}</td>
                </tr>
                <tr>
                  <td>Price:</td>
                  <td>{price} EUR</td>
                </tr>
                <tr>
                  <td>Color:</td>
                  <td className='product-tip-color'>
                    <div style={{ backgroundColor: color }} />
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <button>Buy now</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      }

      const TableContainer = () => {
        const [tips, setTips] = useState([])
        const { wrapper } = useContext(ConfigContext)
        const [state, dispatch] = useReducer(tableReducer, {
          columns: [
            {
              id: 'name',
              label: 'Name',
              Cell: NameCell
            },
            {
              id: 'phone',
              label: 'Phone'
            },
            {
              id: 'products',
              label: 'Products',
              Cell: ProductsCell
            }
          ],
          data: [],
          pageIndex: 0,
          pageCount: 0,
          pageSize: 100,
          loading: false
        })
        console.log('STATE', state)
        const { pageIndex, pageSize } = state

        useEffect(() => {
          dispatch({
            type: PAGING,
            pageIndex,
            pageSize
          })
        }, [pageIndex, pageSize])

        return (
          <MergingConfigProvider
            value={{
              show: {
                delay: 150
              },
              hide: {
                delay: 200
              },
              position: {
                container: '#company-table',
                target: 'mouse',
                adjust: {
                  method: {
                    flip: [
                      'top-left',
                      'center-left',
                      'bottom-left',
                      'top-right',
                      'bottom-right'
                    ]
                  }
                }
              },
              wrapper: Pinnable,
              wrapperProps: { wrapper }
            }}
          >
            <div id='company-table'>
              <Storage
                tips={tips}
                tip={tipid => {
                  const [, kind, id] = /(prd|sel)@(.+)/.exec(tipid) || []
                  if (kind === 'prd') {
                    const [, sellerId, productId] = /(\d+)-(\d+)/.exec(id) || []
                    const product = models[sellerId].products[productId]
                    return <ProductTip key={tipid} product={product} />
                  } else if (kind === 'sel') {
                    return <SellerTip key={tipid} model={models[id]} />
                  }
                }}
                onTipChange={tips => {
                  setTips(tips)
                }}
              >
                <TableDispatch.Provider value={dispatch}>
                  <Table state={state} />
                </TableDispatch.Provider>
              </Storage>
            </div>
          </MergingConfigProvider>
        )
      }
      return <TableContainer />
    },
    {
      readme: {
        content: TableReadme,
        sidebar: StorageReadme
      }
    }
  )
  .add(
    'Multiline chart sticky notes',
    () => {
      const W = 600
      const H = 200
      const count = 50
      const colors = ['red', 'black', 'blue', 'green']
      const model = colors.map((color, index) => ({
        id: `line-${index}`,
        color,
        points: [...seq(0, count)].map(x => ({
          x: (W * x) / count,
          y: H * (0.2 + Math.random() * 0.6)
        })),
        coordinates: { x: 0, y: 0 }
      }))
      const toIndex = id => {
        const [, index] = /line-(\d+)/.exec(id) || []
        return index
      }
      const modelReducer = (state, action) => {
        const { id, coordinates } = action
        const index = toIndex(id)
        const newState = [...state]
        newState[index] = {
          ...state[index],
          coordinates
        }
        return newState
      }

      const Graph = props => {
        const { id, color, points, dispatch } = props
        const config = useContext(ConfigContext)
        const ref = useRef(null)
        const graphConfig = useMemo(
          () => ({
            position: {
              container: '.multi-line-chart',
              adjust: {
                mouse: position => {
                  const rect = ref.current
                  // Compute the coordinates of the point
                  const ctm = rect.getScreenCTM()
                  const pos = rect.ownerSVGElement.createSVGPoint()
                  pos.x = position.x
                  pos.y = position.y
                  const pos2 = pos.matrixTransform(ctm.inverse())
                  const index = Math.max(
                    0,
                    Math.min(Math.floor((pos2.x * count) / W), count - 1)
                  )
                  const x = points[index].x
                  const y = Math.round(points[index].y)
                  Promise.resolve().then(() => {
                    // Update position asynchonously since one cannot
                    // update Graph when rendering tooltip
                    // https://fb.me/setstate-in-render
                    dispatch({ id, coordinates: { x, y } })
                  })

                  // Compte the x-coordinate of the rect
                  const { left } = rect.ownerSVGElement.getBoundingClientRect()
                  return {
                    x: left + x + window.scrollX,
                    y: ctm.f + y + window.scrollY
                  }
                }
              }
            },
            show: {
              delay: 105
            },
            hide: {
              delay: 100
            },
            wrapper: Pinnable,
            wrapperProps: { wrapper: config.wrapper }
          }),
          []
        )
        return (
          <MergingConfigProvider value={graphConfig}>
            <svg
              width='600px'
              height='200px'
              style={{ border: '1px dotted black' }}
            >
              <Source id={id} svg>
                <rect
                  x={0}
                  y={0}
                  width={600}
                  height={200}
                  style={{ fill: 'white', stroke: 'none' }}
                  ref={ref}
                />
                <path
                  style={{ stroke: color, fill: 'none' }}
                  d={points
                    .map(({ x, y }, index) => `${index ? 'L' : 'M'} ${x},${y}`)
                    .join(' ')}
                />
              </Source>
            </svg>
          </MergingConfigProvider>
        )
      }

      const MultiLineChart = props => {
        const [tips, setTips] = useState([])
        const [state, dispatch] = useReducer(modelReducer, props.model)
        return (
          <Storage
            tips={tips}
            tip={(id, pinned) => {
              const index = toIndex(id)
              const { coordinates } = state[index]
              return (
                <div key={id}>
                  x={coordinates.x}
                  <br />
                  y={coordinates.y}
                </div>
              )
            }}
            onTipChange={tips => {
              setTips(tips)
            }}
          >
            <div className='multi-line-chart'>
              {state.map(({ id, color, points }, index) => (
                <Graph
                  key={index}
                  id={id}
                  color={color}
                  points={points}
                  dispatch={dispatch}
                />
              ))}
            </div>
          </Storage>
        )
      }
      return <MultiLineChart model={model} />
    },
    {
      readme: {
        content: MultiLineChartReadme,
        sidebar: StorageReadme
      }
    }
  )
