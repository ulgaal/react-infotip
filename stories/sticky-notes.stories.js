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
import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'

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
import docgen from './docgen'
import { generateMarkdown } from './generateMarkdown'

import { styleDecorator, wrapperDecorator, layoutDecorator } from './decorators'

import './sticky-notes.stories.css'
import faker from 'faker'
import ReactTable from 'react-table'
import 'react-table/react-table.css'

const StorageReadme = generateMarkdown('Storage', docgen['src/Storage.js'][0])

storiesOf('Sticky-notes', module)
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
        const [pinnedTips, setPinnedTips] = useState(storedTips)
        const persistTips = tips => {
          setPinnedTips(tips)
          try {
            window.localStorage.setItem('persistent-tips', JSON.stringify(tips))
          } catch (err) {
            console.log(err)
          }
        }
        return (
          <ConfigContext.Consumer>
            {({ wrapper }) => {
              return (
                <div style={{ height: '250px' }}>
                  <MergingConfigProvider
                    value={{
                      show: {
                        delay: 0
                      },
                      hide: {
                        delay: 200
                      },
                      wrapper: Pinnable,
                      wrapperProps: { wrapper }
                    }}
                  >
                    <Storage
                      tips={pinnedTips}
                      tip={(id, pinned) => (
                        <div key={id} className='storable-tip'>
                          <span>
                            {`Tip for ${
                              models.find(model => model.id === id).label
                            }`}
                          </span>
                          <br/>
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
                      <div
                        style={{ display: 'flex' }}
                        className='centered-rect'
                      >
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
            }}
          </ConfigContext.Consumer>
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
      const { helpers, internet } = faker
      const models = [...seq(0, 200)].map(id => ({
        id,
        ...helpers.userCard(),
        image: internet.avatar()
      }))
      const NameCell = ({ value, original }) => {
        return (
          <Source id={`${original.id}`}>
            <div className='card-source'>{value}</div>
          </Source>
        )
      }
      const columns = [
        {
          id: 'name',
          accessor: 'name',
          Header: 'Name',
          Cell: NameCell
        },
        {
          id: 'phone',
          accessor: 'phone',
          Header: 'Phone'
        }
      ]
      const Card = props => {
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
          <div className='card'>
            <table>
              <tbody>
                <tr>
                  <td className='card-key'>Name:</td>
                  <td>{name}</td>
                  <td rowSpan={5}>
                    <img className='card-image' src={image} />
                  </td>
                </tr>
                <tr>
                  <td className='card-key'>User Name:</td>
                  <td>{username}</td>
                </tr>
                <tr>
                  <td className='card-key'>Email:</td>
                  <td>{email}</td>
                </tr>
                <tr>
                  <td className='card-key'>Phone:</td>
                  <td>{phone}</td>
                </tr>
                <tr>
                  <td className='card-key'>Company:</td>
                  <td>{company.name}</td>
                </tr>
                <tr>
                  <td className='card-key'>Address:</td>
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
      const TableContainer = () => {
        const [tips, setTips] = useState([])
        return (
          <ConfigContext.Consumer>
            {({ wrapper }) => {
              return (
                <MergingConfigProvider
                  value={{
                    show: {
                      delay: 200
                    },
                    hide: {
                      delay: 600
                    },
                    position: {
                      container: '#company-table'
                    },
                    wrapper: Pinnable,
                    wrapperProps: { wrapper }
                  }}
                >
                  <div id='company-table'>
                    <Storage
                      tips={tips}
                      tip={(id, pinned) => {
                        const model = models[id]
                        return <Card key={id} model={model} />
                      }}
                      onTipChange={tips => {
                        setTips(tips)
                      }}
                    >
                      <ReactTable data={models} columns={columns} />
                    </Storage>
                  </div>
                </MergingConfigProvider>
              )
            }}
          </ConfigContext.Consumer>
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
