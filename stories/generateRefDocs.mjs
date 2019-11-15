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
import promisify from 'promisify-node'
import { generateMarkdown } from './generateMarkdown.mjs'

const fs = promisify('fs')

const generateDoc = async () => {
  const docgen = JSON.parse(await fs.readFile('./stories/docgen.json'))
  for (const file of Object.keys(docgen)) {
    console.log(`Generating ${file}`)
    const name = /src\/(.+).js/.exec(file)[1]
    await fs.writeFile(
      `./doc/ref/${name}.md`,
      generateMarkdown(name, docgen[file][0])
    )
  }
}

generateDoc()
