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
  useEffect,
  useCallback
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
  seq,
  styles,
  Pin
} from '../src'

import PersistentReadme from './md/storage/persistent.md'
import TableReadme from './md/storage/table.md'
import MultiLineChartReadme from './md/storage/multi-line-chart.md'
import DisablingNotesReadme from './md/storage/disabling-notes.md'
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
  PAGING,
  VSCROLL
} from 'react-reducer-table'
import img from './ai-faces.jpg'
import { model } from './graphs/model'
import Graph from './graphs/Graph'
import {
  multiLineChartReducer,
  TIP,
  MultiLineChartContext
} from './graphs/multiLineChartReducer'
import ChartTip from './graphs/ChartTip'
import CurveTip from './graphs/CurveTip'

const LOAD_PRODUCT = 'LOAD_PRODUCT'

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
        err
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
            err
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
      const { helpers, commerce } = faker
      const models = [...seq(0, 200)].map(sellerId => ({
        id: sellerId,
        ...helpers.userCard(),
        // replaced internet.avatar which does not work any more
        // with a 9x15 mosaic of ai generated people faces
        image: Math.floor(135 * Math.random()),
        products: [...seq(0, 1 + Math.floor(20 * Math.random()))].map(
          productId => ({
            id: `${sellerId}-${productId}`,
            color: commerce.color(),
            department: commerce.department(),
            productName: commerce.productName(),
            price: commerce.price(),
            product: commerce.product(),
            loaded: false
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

          case COLUMN_REORDERING: {
            return { ...state, columns: action.columns }
          }

          case COLUMN_RESIZING: {
            return {
              ...state,
              columns: columns.map(column =>
                column.id === action.id
                  ? { ...column, width: action.width }
                  : column
              )
            }
          }

          case LOAD_PRODUCT: {
            const { sellerId, productId } = action
            const { pageSize, pageIndex, data } = state
            if (
              sellerId >= pageIndex * pageSize &&
              sellerId < (pageIndex + 1) * pageSize
            ) {
              // row is visible, create an updated row model
              const model = models[sellerId]
              const newModel = { ...model, products: [...model.products] }
              newModel.products[productId].loaded = true
              const rowIndex = sellerId % pageSize
              const newData = [...data]
              newData[rowIndex] = newModel
              return { ...state, data: newData }
            }
            return state
          }

          case VSCROLL: {
            return state
          }

          default: {
            throw new Error(`Unknown action: ${type}`)
          }
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
        // ('Product', props)
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
        const x = image % 15
        const y = Math.floor(image / 15)
        return (
          <div className='seller-tip'>
            <table>
              <tbody>
                <tr>
                  <td className='seller-tip-key'>Name:</td>
                  <td>{name}</td>
                  <td rowSpan={5}>
                    <svg className='seller-tip-image' title={name}>
                      <image
                        x={0}
                        y={0}
                        href={img}
                        transform={`scale(1.6, 1.6) translate(-${x * 50}, -${y *
                          50})`}
                      />
                    </svg>
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
        // ('ProductTip', props)
        const {
          product: { department, price, product, productName, color, loaded }
        } = props
        return (
          <div className='product-tip'>
            {
              loaded
                ? (
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
                        <td />
                        <td>
                          <button>Buy now</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  )
                : (
                  <div>Querying database...</div>
                  )
            }
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
                      'top-right',
                      'center-left',
                      'center-right',
                      'bottom-left',
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
                    const { loaded } = product
                    if (!loaded) {
                      setTimeout(() => {
                        dispatch({ type: LOAD_PRODUCT, sellerId, productId })
                      }, Math.floor(Math.random() * 2000))
                    }
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
      const MultiLineChart = props => {
        const { model } = props
        const [state, dispatch] = useReducer(multiLineChartReducer, {
          graphs: model,
          tips: []
        })
        const { tips, graphs } = state

        const renderTips = useCallback(
          (tipid, pinned) => {
            const [, kind, index] = /(ti|cu)@(.+)/.exec(tipid) || []
            if (kind === 'ti') {
              const { extremum } = graphs[index]
              return <ChartTip key={index} extremum={extremum} />
            } else {
              const { points, ptIndex } = graphs[index]
              const point = points[ptIndex]
              return <CurveTip key={index} point={point} />
            }
          },
          [graphs]
        )

        const handleTips = useCallback(
          tips => {
            dispatch({ type: TIP, tips })
          },
          [dispatch]
        )

        return (
          <MultiLineChartContext.Provider value={dispatch}>
            <Storage tips={tips} tip={renderTips} onTipChange={handleTips}>
              <div className='multi-line-chart'>
                <div className='multi-line-chart-container'>
                  {graphs.map((graph, index) => {
                    return (
                      <Graph
                        key={index}
                        index={index}
                        graph={graph}
                      />
                    )
                  })}
                </div>
              </div>
            </Storage>
          </MultiLineChartContext.Provider>
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
  .add(
    'Disabling sticky notes',
    () => {
      const Disablable = props => {
        const { label, disabled, dispatch } = props
        const handleChange = useCallback(event => {
          dispatch({
            type: 'LOCAL_DISABLE',
            which: label,
            disabled: event.target.checked
          })
        }, [])
        return (
          <div className='disabable'>
            <span className='disabable-label'>{label}</span>
            <span className='disabable-checkbox'>
              <input
                type='checkbox'
                onChange={handleChange}
                checked={disabled}
              />{' '}
              disabled
            </span>
          </div>
        )
      }
      const DisablableTip = props => {
        const { label } = props
        return <div>{label} tip</div>
      }
      const storageReducer = (state, action) => {
        // ('storageReducer', state, action)
        const { type } = action
        switch (type) {
          case 'TIP': {
            return { ...state, tips: action.tips }
          }
          case 'GLOBAL_DISABLE': {
            return { ...state, globalDisabled: action.disabled }
          }
          case 'LOCAL_DISABLE': {
            return {
              ...state,
              localDisabled: {
                ...state.localDisabled,
                [action.which]: action.disabled
              }
            }
          }
          default:
            throw new Error(`Unknown action: ${type}`)
        }
      }
      const DisablingNotesStory = props => {
        const config = useContext(ConfigContext)
        const [state, dispatch] = useReducer(storageReducer, {
          tips: [],
          globalDisabled: false,
          localDisabled: {
            north: false,
            west: false,
            south: false,
            east: false
          }
        })
        const { tips, globalDisabled, localDisabled } = state
        const handleGlobalChange = useCallback(event => {
          dispatch({ type: 'GLOBAL_DISABLE', disabled: event.target.checked })
        }, [])
        return (
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
              tips={tips}
              tip={(id, pinned) => {
                return <DisablableTip label={id} key={id} />
              }}
              onTipChange={tips => {
                dispatch({ type: 'TIP', tips })
              }}
              disabled={globalDisabled}
            >
              <div className='disabling-notes'>
                <div className='disabling-notes-top'>
                  <Source id='north' disabled={localDisabled.north}>
                    <Disablable
                      disabled={localDisabled.north}
                      dispatch={dispatch}
                      label='north'
                    />
                  </Source>
                </div>
                <div className='disabling-notes-middle'>
                  <Source id='west' disabled={localDisabled.west}>
                    <Disablable
                      disabled={localDisabled.west}
                      dispatch={dispatch}
                      label='west'
                    />
                  </Source>
                  <Source id='east' disabled={localDisabled.east}>
                    <Disablable
                      disabled={localDisabled.east}
                      dispatch={dispatch}
                      label='east'
                    />
                  </Source>
                </div>
                <div className='disabling-notes-bottom'>
                  <Source id='south' disabled={localDisabled.south}>
                    <Disablable
                      disabled={localDisabled.south}
                      dispatch={dispatch}
                      label='south'
                    />
                  </Source>
                  <span>
                    <input
                      type='checkbox'
                      onChange={handleGlobalChange}
                      checked={globalDisabled}
                    />{' '}
                    Global disabled
                  </span>
                </div>
              </div>
            </Storage>
          </MergingConfigProvider>
        )
      }
      return <DisablingNotesStory />
    },
    {
      readme: {
        content: DisablingNotesReadme,
        sidebar: StorageReadme
      }
    }
  )
