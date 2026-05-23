const fs = require('fs')
const path = require('path')

const candidates = [
  path.join(__dirname, '..', 'node_modules', 'libavoid-js', 'dist', 'libavoid.wasm'),
  path.join(__dirname, '..', '..', '..', 'node_modules', 'libavoid-js', 'dist', 'libavoid.wasm'),
]

const src = candidates.find((p) => fs.existsSync(p))
if (!src) {
  process.exit(0)
}

const dest = path.join(__dirname, '..', 'public', 'libavoid.wasm')
fs.mkdirSync(path.dirname(dest), { recursive: true })
fs.copyFileSync(src, dest)
