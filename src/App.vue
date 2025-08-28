<template>
  <div class="wrap">
    <h1>Vue Rogue</h1>

    <Hud
      :game="store.game"
      :stats="store.stats"
      :level="store.level"
      :messages="store.messages"
    />

    <div class="layout">
      <aside class="sidebar">
        <div class="panel">
          <h3>Inventory</h3>
          <div v-if="store.inventory.length === 0" class="muted">empty</div>
          <ul>
            <li v-for="(it, i) in store.inventory" :key="i">{{ it.name }} ({{ it.glyph }})</li>
          </ul>
        </div>

        <div class="panel">
          <h3>Controls</h3>
          <div class="muted">Arrow Keys / WASD to move</div>
          <div class="muted">R to go down a level (regenerate)</div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Hud from './components/Hud.vue'
import { useKeyboard } from './composables/useKeyboard'
import { useGameStore } from './stores/gameStore'

const store = useGameStore()

useKeyboard({
  onMove: store.move,
  onRegenerate: () => store.regenerate(true)
})
</script>

<style scoped>
.wrap {
  max-width: 1100px;
  margin: 20px auto;
  padding: 12px;
  color: #e6e6e6;
  background: #121212;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  border: 1px solid #101010;
  border-radius: 4px;
}
h1 {
  margin: 0 0 8px;
  font-weight: 800;
  font-size: 20px;
}
.layout {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.sidebar {
  width: 220px;
}
.panel {
  background: #0e0f12;
  border: 1px solid #22262b;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 8px;
}
.muted { color: #9aa1a6; font-size: 13px; }
</style>
