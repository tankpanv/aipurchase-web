import { defineStore } from 'pinia'
import type { Race } from '@/api/admin/race'

export const useRaceStore = defineStore('race', {
  state: () => ({
    currentRace: null as Race | null,
  }),
  actions: {
    setCurrentRace(race: Race) {
      this.currentRace = race
    },
    clearCurrentRace() {
      this.currentRace = null
    },
  },
}) 