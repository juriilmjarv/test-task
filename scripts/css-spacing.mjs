import { readdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'
import console from 'node:console'
import path from 'node:path'
import postcss from 'postcss'

const sourceDirectory = fileURLToPath(new URL('../src/', import.meta.url))
const write = process.argv.includes('--write')
const files = await readdir(sourceDirectory, { recursive: true })

for (const name of files.filter((name) => name.endsWith('.css'))) {
  const file = path.join(sourceDirectory, name)
  const original = await readFile(file, 'utf8')
  const root = postcss.parse(original, { from: file })

  root.walk((node) => {
    if (node.type !== 'rule' && !(node.type === 'atrule' && node.nodes)) return

    const previous = node.prev()

    if (!previous || previous.type === 'comment') return

    const before = node.raws.before ?? ''

    if (/\n[\t ]*\n/.test(before)) return

    const indentation = before.slice(before.lastIndexOf('\n') + 1)

    node.raws.before = `\n\n${indentation}`
  })

  const formatted = root.toString()

  if (formatted === original) continue

  if (write) {
    await writeFile(file, formatted)
  } else {
    console.error(`src/${name}: add a blank line between CSS rules (npm run format)`)
    process.exitCode = 1
  }
}
