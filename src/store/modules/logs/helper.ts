import { ss } from '@/utils/storage'

const LOCAL_NAME = 'localLogStorage'
export interface LocalLogHistoryItem {
  timestamp: string
  log: string
}
export interface LocalLogHistory {
  datetime: string
  logList: LocalLogHistoryItem[]
}
export interface LocalLogState {

  history: LocalLogHistory[]
}

export function defaultState(): LocalLogState {
  return {

    history: [],

  }
}

export function getLocalState(): LocalLogState {
  const localState = ss.get(LOCAL_NAME)
  return { ...defaultState(), ...localState }
}

export function setLocalState(state: LocalLogState) {
  ss.set(LOCAL_NAME, state)
}
