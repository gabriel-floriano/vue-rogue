import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import {
  createGame,
  makeDungeon,
  type Game
} from '../engine/rogue'

const WIDTH = 0
const HEIGHT = 0

export const useGameStore = defineStore('game', () => {
  const game = reactive(createGame(WIDTH, HEIGHT))

  const level = ref(1)
  const messages = ref<string[]>([])
  const stats = reactive({
    hp: 20,
    maxHp: 20,
    attack: 5,
    defense: 2
  })
  const inventory = ref<{ name: string; glyph: string }[]>([])

  function init() {
    game.dungeon = makeDungeon(WIDTH, HEIGHT, {
      maxRooms: 16,
      roomMin: 4,
      roomMax: 10,
      seed: Date.now()
    })
    game.centerPlayer()
    messages.value = [`You descend to level ${level.value}.`]
    inventory.value = []
  }

  function regenerate(nextLevel = false) {
    if (nextLevel) level.value++
    init()
  }

  function move(dx: number, dy: number) {
    const nx = game.player.x + dx
    const ny = game.player.y + dy
    if (!game.isWalkable(nx, ny)) return

    const ent = game.entityAt(nx, ny)
    if (ent && ent.blocks) {
      attack(ent)
      return
    }

    game.player.x = nx
    game.player.y = ny
  }

  function attack(target: { glyph: string; x: number; y: number }) {
    const dmg = Math.max(1, stats.attack - 1)
    messages.value.unshift(`You hit the ${target.glyph} for ${dmg} damage.`)
    if (messages.value.length > 8) messages.value.pop()

      game.entities = game.entities.filter(e => e !== target)
  }

  function addItem(item: { name: string; glyph: string }) {
    inventory.value.push(item)
    messages.value.unshift(`You picked up ${item.name}.`)
    if (messages.value.length > 8) messages.value.pop()
  }

  function log(msg: string) {
    messages.value.unshift(msg)
    if (messages.value.length > 8) messages.value.pop()
  }


  init()

  return {
    game,
    WIDTH,
    HEIGHT,
    level,
    messages,
    stats,
    inventory,
    init,
    regenerate,
    move,
    attack,
    addItem,
    log
  }
})
