import { atomWithStorage } from 'jotai/utils'

/** Persisted dev-mode flag. When true, extra developer links are shown in the nav. */
export const devModeAtom = atomWithStorage<boolean>('admin:dev', false)
