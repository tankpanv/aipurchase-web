import { defineStore } from 'pinia'
import { defaultState, getLocalState, setLocalState } from './helper'
import type { LocalLogHistoryItem, LocalLogState } from './helper'

export const useLocalLogStore = defineStore('local-log-store', {
  state: (): LocalLogState => getLocalState(),

  getters: {

    getLog(state: LocalLogState) {
      return (datetime?: string) => {
        if (state.history && state.history.length > 0) {
          if (datetime)
            return state.history.find(item => item.datetime === datetime)?.logList ?? state.history[0]
          return state.history[0]
        }
        return {}
      }
    },
  },

  actions: {

    addHistoryByDate(datetime: string, log: LocalLogHistoryItem) {
      if (this.$state.history && this.$state.history.length > 0) {
        if (datetime) {
          const foundHistory = this.$state.history.find(item => item.datetime === datetime)
          if (foundHistory) {
            //
            foundHistory.logList.push(log)
            return
          }
        }
      }
      this.$state.history.push({ datetime, logList: [log] })
    },

    clearHistory() {
      this.$state = { ...defaultState() }
      this.recordState()
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
