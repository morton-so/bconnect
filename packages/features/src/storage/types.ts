/**
 * TODO(BE storage 도메인): 스펙 확정 시 orval generated 타입으로 교체. 그때 *View 컴포넌트는 무변경,
 *   앱 어댑터의 데이터소스(lib/storage-mock)만 교체.
 */

export type BoardPosition = 'tl' | 'tr' | 'bl' | 'br'

export interface BoardRow {
  key: string
  value: string
}

export interface Folder {
  id: string
  projectId: string
  title: string
  createdAt: string
  coverImageUrl?: string
  fileCount: number // BE 미지원
}

export interface BoardImage {
  id: string
  folderId: string
  imageUrl: string
  filename?: string
  boardRows: BoardRow[]
  boardPosition: BoardPosition
  description: string
  createdAt: string
}

export interface Memo {
  id: string
  folderId: string
  createdAt: string
  content: string
}

export interface MetaTemplate {
  keys: string[]
}

export interface StorageUsage {
  usedBytes: number
  totalBytes: number
}

export interface QueryResult<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
}
