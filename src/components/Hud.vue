<template>
  <div class="hud">
    <div class="row">
      <div>Pos: ({{ game.player.x }}, {{ game.player.y }})</div>
      <div>Rooms: {{ game.dungeon.rooms.length }}</div>
      <div>Depth: {{ level }}</div>
    </div>

    <div class="stats">
      HP: {{ stats.hp }}/{{ stats.maxHp }} &nbsp;|&nbsp;
      Atk: {{ stats.attack }} &nbsp;|&nbsp;
      Def: {{ stats.defense }}
    </div>

    <div class="messages" v-if="messages.length">
      <div class="msg" v-for="(m, i) in messages" :key="i">{{ m }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Game } from '../engine/rogue'

const props = defineProps<{
  game: Game
  stats: { hp: number; maxHp: number; attack: number; defense: number }
  level: number
  messages: string[]
}>()
</script>

<style scoped>
.hud {
  font-size: 13px;
  color: #9aa1a6;
  margin-bottom: 8px;
}
.row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 6px;
}
.stats {
  color: #e6e6e6;
  margin-bottom: 6px;
}
.messages {
  background: #16181d;
  padding: 6px;
  border: 1px solid #2b2f36;
  border-radius: 4px;
  max-height: 80px;
  overflow-y: auto;
}
.msg { font-family: monospace; font-size: 12px; color: #cfd6dd; }
</style>
