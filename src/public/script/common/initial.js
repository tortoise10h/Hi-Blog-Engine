/** ===== DEFAULT URL ===== */
const DEFAULT_URL = 'http://localhost:5099'
const TIMEOUT = 15000

/** ===== Showdown initialize ===== */
// const classMap = {
// h1: 'ui large header',
// h2: 'ui medium header',
// ul: 'ui list',
// li: 'ui item'
// }

// const bindings = Object.keys(classMap).map(key => ({
// type: 'output',
// regex: new RegExp(`<${key}(.*)>`, 'g'),
// replace: `<${key} class="${classMap[key]}" $1>`
// }))
// const converter = new showdown.Converter({
// extensions: [...bindings]
// })

/** ===== Markdownit initialize ===== */
const converter = window.markdownit({
  html: true,
  linkify: true,
  typographer: true
})
