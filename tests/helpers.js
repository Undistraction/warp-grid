import { readFile, writeFile } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { promisify } from 'util'

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const readFileAsync = promisify(readFile)
export const writeFileAsync = promisify(writeFile)

export const __filename = fileURLToPath(import.meta.url)
export const __dirname = dirname(__filename)
