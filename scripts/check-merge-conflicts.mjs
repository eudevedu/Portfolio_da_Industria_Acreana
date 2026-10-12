import { readdirSync, readFileSync } from "node:fs"
import { extname, join, relative, resolve } from "node:path"

const root = resolve(process.argv[2] || process.cwd())
const ignored = new Set(["node_modules", ".git", ".next", ".vercel", "coverage"])
const sourceExtensions = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".json", ".css", ".sql", ".yaml", ".yml", ".html", ".md"])
const marker = /^(?:<{7}(?:\s|$)|={7}\s*$|>{7}(?:\s|$)|\|{7}(?:\s|$))/
let conflicts = 0

function scan(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue
    const file = join(directory, entry.name)
    if (entry.isDirectory()) {
      scan(file)
    } else if (entry.isFile() && sourceExtensions.has(extname(entry.name))) {
      const lines = readFileSync(file, "utf8").split(/\r?\n/)
      lines.forEach((line, index) => {
        if (marker.test(line)) {
          console.error(`${relative(root, file)}:${index + 1}: conflito de merge não resolvido`)
          conflicts++
        }
      })
    }
  }
}

scan(root)
if (conflicts) {
  console.error(`Build bloqueado: ${conflicts} marcador(es) de conflito. Resolva os conflitos antes de compilar.`)
  process.exitCode = 1
} else {
  console.log("Verificação concluída: nenhum marcador de conflito de merge.")
}
