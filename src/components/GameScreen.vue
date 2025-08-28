<template>
  <div class="screen" ref="screen" role="application" aria-label="Game screen">
    <div
      class="grid"
      :style="{
        gridTemplateColumns: `repeat(${vw}, 1ch)`,
        gridTemplateRows: `repeat(${vh}, 1em)`,
        width: `${vw}ch`,
        height: `${vh}em`
      }"
    >
      <template v-for="(row, ry) in gridTiles" :key="ry">
        <template v-for="(cell, rx) in row" :key="rx + '-' + ry">
          <span :class="['tile', cell.tint]" v-text="cell.ch"></span>
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { type Game, TileType, computeFOV } from '../engine/rogue'

const props = defineProps<{
  game: Game
  width: number
  height: number
  viewRadius: number
  viewportWidth?: number
  viewportHeight?: number
}>()

const vw = computed(() => props.viewportWidth ?? 40)
const vh = computed(() => props.viewportHeight ?? 20)

const screen = ref<HTMLElement | null>(null)
onMounted(() => screen.value?.focus())

const gridTiles = computed(() => {
  computeFOV(props.game, props.viewRadius)

  const mapW = props.width
  const mapH = props.height
  const px = props.game.player.x
  const py = props.game.player.y

  const halfW = Math.floor(vw.value / 2)
  const halfH = Math.floor(vh.value / 2)

  let camX = px - halfW
  let camY = py - halfH

  camX = Math.max(0, Math.min(mapW - vw.value, camX))
  camY = Math.max(0, Math.min(mapH - vh.value, camY))

  if (mapW <= vw.value) camX = 0
  if (mapH <= vh.value) camY = 0

  const out: { ch: string; tint: string }[][] = []
  for (let y = camY; y < camY + vh.value; y++) {
    const row: { ch: string; tint: string }[] = []
    for (let x = camX; x < camX + vw.value; x++) {
      const inBounds = x >= 0 && y >= 0 && x < mapW && y < mapH
      const i = inBounds ? y * mapW + x : -1
      const tile = inBounds ? props.game.dungeon.tiles[i] : TileType.Wall
      const visible = inBounds ? props.game.visible[i] : false
      const explored = inBounds ? props.game.explored[i] : false

      let ch = ' '
      let tint = 'void'

      if (visible) {
        const ent = props.game.entityAt(x, y)
        if (ent) {
          ch = ent.glyph
          tint = ent.glyph === '@' ? 'player' : 'enemy'
        } else {
          ch = tile === TileType.Floor ? '.' : '#'
          tint = tile === TileType.Floor ? 'lit' : 'wall'
        }
      } else if (explored) {
        ch = tile === TileType.Floor ? '·' : '#'
        tint = 'dim'
      } else {
        ch = ' '
        tint = 'void'
      }

      if (x === px && y === py) {
        ch = props.game.player.glyph
        tint = 'player'
      }

      row.push({ ch, tint })
    }
    out.push(row)
  }

  return out
})
</script>

<style scoped>
.screen {
  user-select: none;
  overflow: hidden;
  padding: 6px;
  background: #0f1115;
  border-radius: 6px;
  border: 1px solid #22262b;
  box-shadow: inset 0 0 0 1px #0a0c10;
}

.grid {
  display: grid;
  gap: 0;
  line-height: 1;
  overflow: hidden;
}

.tile {
  display: inline-block;
  width: 1ch;
  height: 1em;
  text-align: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 16px;
  line-height: 1em;
  vertical-align: middle;
  color: #d9dfeb;
}

.player { color: #ffd369; font-weight: 700; }
.enemy  { color: #d65f5f; }
.lit    { color: #c7cdd8; }
.wall   { color: #8aa1b1; }
.dim    { color: #4c5563; }
.void   { color: transparent; }
</style>
