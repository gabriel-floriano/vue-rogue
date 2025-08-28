export enum TileType {
  Wall = 0,
  Floor = 1
}

export type Rect = { x: number; y: number; w: number; h: number }

export type Dungeon = {
  width: number
  height: number
  tiles: TileType[]
  rooms: Rect[]
}

export type Entity = {
  x: number
  y: number
  glyph: string
  blocks: boolean
}

export type Game = {
  width: number
  height: number
  dungeon: Dungeon
  player: Entity
  entities: Entity[]
  explored: boolean[]
  visible: boolean[]
  isWalkable: (x: number, y: number) => boolean
  entityAt: (x: number, y: number) => Entity | undefined
  centerPlayer: () => void
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

export function idx(x: number, y: number, w: number) {
  return y * w + x
}

export function createGame(width: number, height: number): Game {
  const dummyDungeon = makeDungeon(width, height, {
    maxRooms: 1,
    roomMin: 6,
    roomMax: 10,
    seed: 1
  })

  const game: Game = {
    width,
    height,
    dungeon: dummyDungeon,
    player: { x: 2, y: 2, glyph: '@', blocks: true },
    entities: [],
    explored: new Array(width * height).fill(false),
    visible: new Array(width * height).fill(false),
    isWalkable(x, y) {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false
      const t = this.dungeon.tiles[idx(x, y, this.width)]
      return t === TileType.Floor
    },
    entityAt(x, y) {
      if (this.player.x === x && this.player.y === y) return this.player
      return this.entities.find(e => e.x === x && e.y === y)
    },
    centerPlayer() {
      const r = this.dungeon.rooms[0] ?? { x: 1, y: 1, w: 3, h: 3 }
      this.player.x = Math.floor(r.x + r.w / 2)
      this.player.y = Math.floor(r.y + r.h / 2)
      this.explored.fill(false)
      this.visible.fill(false)
      this.entities = []
      for (let i = 1; i < Math.min(6, this.dungeon.rooms.length); i++) {
        const rr = this.dungeon.rooms[i]
        this.entities.push({
          x: rr.x + Math.floor(rr.w / 2),
          y: rr.y + Math.floor(rr.h / 2),
          glyph: 'g',
          blocks: true
        })
      }
    }
  }
  return game
}

type DungeonOpts = {
  maxRooms: number
  roomMin: number
  roomMax: number
  seed: number
}

class RNG {
  private s: number
  constructor(seed = 123456789) {
    this.s = seed >>> 0
  }
  next() {
    let x = this.s
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    this.s = x >>> 0
    return (this.s & 0xffffffff) / 0x100000000
  }
  int(lo: number, hi: number) {
    return Math.floor(this.next() * (hi - lo + 1)) + lo
  }
}

function carveRoom(d: Dungeon, r: Rect) {
  for (let y = r.y; y < r.y + r.h; y++) {
    for (let x = r.x; x < r.x + r.w; x++) {
      d.tiles[idx(x, y, d.width)] = TileType.Floor
    }
  }
}

function carveHTunnel(d: Dungeon, x1: number, x2: number, y: number) {
  for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
    d.tiles[idx(x, y, d.width)] = TileType.Floor
  }
}

function carveVTunnel(d: Dungeon, y1: number, y2: number, x: number) {
  for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
    d.tiles[idx(x, y, d.width)] = TileType.Floor
  }
}

function rectsOverlap(a: Rect, b: Rect) {
  return (
    a.x <= b.x + b.w - 1 &&
    a.x + a.w - 1 >= b.x &&
    a.y <= b.y + b.h - 1 &&
    a.y + a.h - 1 >= b.y
  )
}

function isValidRoom(room: Rect, dungeonWidth: number, dungeonHeight: number): boolean {
  return (
    room.w > 0 &&
    room.h > 0 &&
    room.x >= 0 &&
    room.y >= 0 &&
    room.x + room.w <= dungeonWidth &&
    room.y + room.h <= dungeonHeight
  )
}

export function makeDungeon(width: number, height: number, opts: DungeonOpts): Dungeon {
  const rng = new RNG(opts.seed)
  const tiles = new Array(width * height).fill(TileType.Wall) as TileType[]
  const dungeon: Dungeon = { width, height, tiles, rooms: [] }
  let attempts = 0

  while (dungeon.rooms.length < opts.maxRooms && attempts < opts.maxRooms * 12) {
    attempts++
    const w = rng.int(opts.roomMin, opts.roomMax)
    const h = rng.int(opts.roomMin, opts.roomMax)
    const x = rng.int(1, width - w - 2)
    const y = rng.int(1, height - h - 2)
    const room: Rect = { x, y, w, h }

    if (dungeon.rooms.some(r => rectsOverlap(room, r)) || !isValidRoom(room, width, height)) continue

    carveRoom(dungeon, room)

    if (dungeon.rooms.length > 0) {
      const prev = dungeon.rooms[dungeon.rooms.length - 1]
      const [x1, y1] = [Math.floor(prev.x + prev.w / 2), Math.floor(prev.y + prev.h / 2)]
      const [x2, y2] = [Math.floor(room.x + room.w / 2), Math.floor(room.y + room.h / 2)]
      if (rng.next() < 0.5) {
        carveHTunnel(dungeon, x1, x2, y1)
        carveVTunnel(dungeon, y1, y2, x2)
      } else {
        carveVTunnel(dungeon, y1, y2, x1)
        carveHTunnel(dungeon, x1, x2, y2)
      }
    }

    dungeon.rooms.push(room)
  }

  // border walls
  for (let x = 0; x < width; x++) {
    tiles[idx(x, 0, width)] = TileType.Wall
    tiles[idx(x, height - 1, width)] = TileType.Wall
  }
  for (let y = 0; y < height; y++) {
    tiles[idx(0, y, width)] = TileType.Wall
    tiles[idx(width - 1, y, width)] = TileType.Wall
  }

  return dungeon
}

function los(game: Game, x0: number, y0: number, x1: number, y1: number, maxRadius: number): boolean {
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1
  let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  let x = x0, y = y0

  while (true) {
    if (x === x1 && y === y1) return true
    const e2 = 2 * err
    if (e2 >= dy) { err += dy; x += sx }
    if (e2 <= dx) { err += dx; y += sy }

    const dist2 = (x - x0) * (x - x0) + (y - y0) * (y - y0)
    if (dist2 > maxRadius * maxRadius) return false

    if (!game.isWalkable(x, y) && !(x === x1 && y === y1)) {
      return false
    }
  }
}

export function computeFOV(game: Game, radius: number) {
  const { width, height, player } = game
  game.visible.fill(false)

  const px = player.x, py = player.y
  const r = Math.ceil(radius)
  const xMin = Math.max(0, px - r)
  const xMax = Math.min(width - 1, px + r)
  const yMin = Math.max(0, py - r)
  const yMax = Math.min(height - 1, py + r)

  for (let y = yMin; y <= yMax; y++) {
    for (let x = xMin; x <= xMax; x++) {
      const dist2 = (x - px) * (x - px) + (y - py) * (y - py)
      if (dist2 <= radius * radius) {
        if (los(game, px, py, x, y, radius)) {
          const i = idx(x, y, width)
          game.visible[i] = true
          game.explored[i] = true
        }
      }
    }
  }
}
