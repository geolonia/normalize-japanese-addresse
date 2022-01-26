import * as Normalize from './normalize'
import { currentConfig } from './config'
import { promises as fs } from 'fs'
import unfetch from 'isomorphic-unfetch'

const fetchOrReadFile = async (
  input: string,
): Promise<Response | { json: () => Promise<unknown> }> => {
  const fileURL = new URL(`${currentConfig.japaneseAddressesApi}${input}`)
  if (fileURL.protocol === 'http:' || fileURL.protocol === 'https:') {
    return unfetch(fileURL.toString())
  } else if (fileURL.protocol === 'file:') {
    const filePath = decodeURI(fileURL.pathname)
    return {
      json: async () => {
        const contents = await fs.readFile(filePath)
        return JSON.parse(contents.toString('utf-8'))
      },
    }
  } else {
    throw new Error(`Unknown URL schema: ${fileURL.protocol}`)
  }
}

Normalize.__fetch.shim = fetchOrReadFile
export const config = currentConfig
export const normalize = Normalize.normalize
