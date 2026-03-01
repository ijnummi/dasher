import { atom, getDefaultStore } from 'jotai'

export interface ErrorEntry {
  id: number
  time: Date
  message: string
}

let _nextId = 1

export const errorLogAtom = atom<ErrorEntry[]>([])

/** Push an error from outside React (e.g. QueryCache callbacks). */
export function pushError(message: string): void {
  getDefaultStore().set(errorLogAtom, (prev) => [
    { id: _nextId++, time: new Date(), message },
    ...prev,
  ])
}
