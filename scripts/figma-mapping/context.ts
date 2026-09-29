/**
 * Figma context loader.
 */

import { readFileSync, readdirSync } from 'node:fs'

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN
const FIGMA_API = 'https://api.figma.com/v1'

// Morton 디자인 파일
// https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS
const FIGMA_FILE_KEY = 'EFXofON7gTFbmbE2kB31SS'

// https://www.figma.com/design/<fileKey>/<fileName>?node-id=<nodeId>
const FIGMA_URL_REGEX =
  /https:\/\/(?:www\.)?figma\.com\/design\/([A-Za-z0-9]+)[^?\s]*\?[^=\s]*node-id=([\d-]+)/

// 블록 주석
const JSDOC_BLOCK_REGEX = /\/\*\*[\s\S]*?\*\//

// 각 주석줄의 선행 "* "
const JSDOC_PREFIX_REGEX = /^\s*\*\s?/

// @figma, @figma-todo
const FIGMA_TAG_REGEX = /@figma(?:-todo)?(?![-\w])/

// @figma <url>
const FIGMA_REGEX = /^@figma\s+(\S+)/

// 탐색 범위
const SEARCH_ROOTS = ['apps/career', 'apps/plan', 'apps/company', 'packages/ui/src/components']
const SEARCH_EXCLUDES = new Set(['node_modules', '.next', 'dist', 'build'])

/**
 * 컴포넌트 @figma 태그
 */
export interface FigmaTag {
  file: string // 상대 경로
  nodes: Array<{ url: string; nodeId: string }> // @figma @figma-todo 라인
  type: 'figma' | 'todo' | 'unknown'
}

/**
 * Figma 노드
 */
export interface FigmaNode {
  id: string
  name: string
  type: string
  parentId: string | null
  parentName: string | null
  childIds: string[]
  readyForDev: boolean
}

/**
 * Figma 컨텍스트
 */
export interface FigmaContext {
  fileKey: string
  nodes: Map<string, FigmaNode> // id → node
  tags: FigmaTag[]
}

/**
 * Figma API 노드
 */
interface FigmaApiNode {
  id: string
  name: string
  type: string
  devStatus?: { type: string }
  children?: FigmaApiNode[]
}

/**
 * Node ID 정규화: "1234-5678" → "1234:5678"
 */
function normalizeNodeId(id: string) {
  return id.replace('-', ':')
}

/**
 * @figma JSDoc 태그 파싱
 */
function parseTags(content: string): Pick<FigmaTag, 'nodes' | 'type'> {
  const blockMatch = content.match(JSDOC_BLOCK_REGEX)
  if (!blockMatch) {
    return { nodes: [], type: 'unknown' }
  }

  const block = blockMatch[0]

  const nodes: Array<{ url: string; nodeId: string }> = []

  let type: 'figma' | 'todo' | 'unknown' = 'unknown'

  for (const rawLine of block.split('\n')) {
    const line = rawLine.replace(JSDOC_PREFIX_REGEX, '').trim()
    if (!line) continue

    if (line.startsWith('@figma-todo')) {
      type = 'todo'
      continue
    }
    if (line.startsWith('@figma ')) {
      const m = line.match(FIGMA_REGEX)
      if (m) {
        const urlMatch = m[1].match(FIGMA_URL_REGEX)
        if (urlMatch) {
          nodes.push({ url: m[1], nodeId: normalizeNodeId(urlMatch[2]) })
          type = 'figma'
        }
      }
    }
  }

  return { nodes, type }
}

/**
 * 디렉토리 DFS 순회
 */
function walkComponent(dir: string, acc: string[]) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (SEARCH_EXCLUDES.has(entry.name)) continue

    const fullPath = `${dir}/${entry.name}`
    if (entry.isDirectory()) {
      walkComponent(fullPath, acc)
    } else if (/\.tsx?$/.test(entry.name)) {
      acc.push(fullPath)
    }
  }
}

function loadTags(): FigmaTag[] {
  const files: string[] = []
  for (const root of SEARCH_ROOTS) {
    walkComponent(root, files)
  }

  const tags = []
  for (const file of files) {
    let content
    try {
      content = readFileSync(file, 'utf8')
    } catch (e) {
      console.error(`Failed to read ${file}: ${e}`)
      continue
    }
    if (!FIGMA_TAG_REGEX.test(content)) continue
    const parsed = parseTags(content)
    tags.push({ file, ...parsed })
  }
  return tags
}

/**
 * Figma 파일 트리 전체 로드 · 탐색
 */
async function loadTree(fileKey: string): Promise<Map<string, FigmaNode>> {
  if (!FIGMA_TOKEN) {
    throw new Error('FIGMA_ACCESS_TOKEN env var is required')
  }

  const url = `${FIGMA_API}/files/${fileKey}`
  const res = await fetch(url, { headers: { 'X-Figma-Token': FIGMA_TOKEN } })
  if (!res.ok) {
    throw new Error(`Figma API ${res.status}: ${await res.text()}`)
  }
  const json = await res.json()

  const nodes = new Map<string, FigmaNode>()

  /**
   * Figma 노드 DFS 순회
   */
  function walkNode(node: FigmaApiNode, parent: { id: string; name: string } | null) {
    const childIds = (node.children ?? []).map((c) => c.id)
    nodes.set(node.id, {
      id: node.id,
      name: node.name,
      type: node.type,
      parentId: parent?.id ?? null,
      parentName: parent?.name ?? null,
      childIds,
      readyForDev: node.devStatus?.type === 'READY_FOR_DEV',
    })
    for (const child of node.children ?? []) {
      walkNode(child, { id: node.id, name: node.name })
    }
  }

  walkNode(json.document, null)
  return nodes
}

/**
 * 컨텍스트 로드
 */
export async function loadContext(): Promise<FigmaContext> {
  const tags = loadTags()
  const nodes = await loadTree(FIGMA_FILE_KEY)

  return { fileKey: FIGMA_FILE_KEY, nodes, tags }
}
