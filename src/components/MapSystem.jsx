import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Map, MapPin, Compass, Mountain, Trees, Home, Sword } from 'lucide-react'

// 地图数据结构 - 参照勇者斗恶龙3风格
const generateMap = () => {
  const mapSize = 20
  const map = []
  
  // 初始化地图
  for (let y = 0; y < mapSize; y++) {
    map[y] = []
    for (let x = 0; x < mapSize; x++) {
      map[y][x] = {
        type: 'grass',
        discovered: false,
        hasEvent: false,
        eventType: null
      }
    }
  }
  
  // 生成地形
  // 村庄 (起始点)
  map[10][10] = { type: 'village', discovered: true, hasEvent: false, eventType: null }
  
  // 森林区域
  for (let y = 5; y < 15; y++) {
    for (let x = 5; x < 8; x++) {
      if (Math.random() > 0.3) {
        map[y][x] = { type: 'forest', discovered: false, hasEvent: Math.random() > 0.7, eventType: Math.random() > 0.5 ? 'monster' : 'treasure' }
      }
    }
  }
  
  // 山脉
  for (let y = 2; y < 6; y++) {
    for (let x = 12; x < 18; x++) {
      if (Math.random() > 0.4) {
        map[y][x] = { type: 'mountain', discovered: false, hasEvent: Math.random() > 0.8, eventType: 'monster' }
      }
    }
  }
  
  // 湖泊
  for (let y = 15; y < 19; y++) {
    for (let x = 13; x < 17; x++) {
      if (Math.random() > 0.5) {
        map[y][x] = { type: 'water', discovered: false, hasEvent: false, eventType: null }
      }
    }
  }
  
  // 洞穴入口
  map[3][15] = { type: 'cave', discovered: false, hasEvent: true, eventType: 'dungeon' }
  map[16][6] = { type: 'cave', discovered: false, hasEvent: true, eventType: 'dungeon' }
  
  // 其他城镇
  map[5][5] = { type: 'town', discovered: false, hasEvent: true, eventType: 'shop' }
  map[15][15] = { type: 'town', discovered: false, hasEvent: true, eventType: 'shop' }
  
  return map
}

// 地形图标映射
const getTerrainIcon = (type) => {
  switch (type) {
    case 'village': return '🏘️'
    case 'town': return '🏛️'
    case 'forest': return '🌲'
    case 'mountain': return '⛰️'
    case 'water': return '🌊'
    case 'cave': return '🕳️'
    case 'grass': return '🌱'
    default: return '🌱'
  }
}

// 地形颜色映射
const getTerrainColor = (type, discovered) => {
  if (!discovered) return 'bg-gray-600'
  
  switch (type) {
    case 'village': return 'bg-yellow-500'
    case 'town': return 'bg-blue-500'
    case 'forest': return 'bg-green-600'
    case 'mountain': return 'bg-gray-500'
    case 'water': return 'bg-blue-400'
    case 'cave': return 'bg-purple-600'
    case 'grass': return 'bg-green-300'
    default: return 'bg-green-300'
  }
}

const MapSystem = ({ player, onPlayerUpdate, onClose, onMapEvent }) => {
  const [gameMap, setGameMap] = useState(() => generateMap())
  const [playerPos, setPlayerPos] = useState({ x: 10, y: 10 })
  const [viewOffset, setViewOffset] = useState({ x: 5, y: 5 })
  const viewSize = 10 // 显示10x10的区域

  // 移动玩家
  const movePlayer = (dx, dy) => {
    const newX = Math.max(0, Math.min(19, playerPos.x + dx))
    const newY = Math.max(0, Math.min(19, playerPos.y + dy))
    
    if (newX !== playerPos.x || newY !== playerPos.y) {
      setPlayerPos({ x: newX, y: newY })
      
      // 更新视野偏移
      setViewOffset({
        x: Math.max(0, Math.min(10, newX - 5)),
        y: Math.max(0, Math.min(10, newY - 5))
      })
      
      // 发现新区域
      const newMap = [...gameMap]
      for (let y = Math.max(0, newY - 1); y <= Math.min(19, newY + 1); y++) {
        for (let x = Math.max(0, newX - 1); x <= Math.min(19, newX + 1); x++) {
          newMap[y][x] = { ...newMap[y][x], discovered: true }
        }
      }
      setGameMap(newMap)
      
      // 检查事件
      const currentTile = newMap[newY][newX]
      if (currentTile.hasEvent && currentTile.eventType) {
        handleMapEvent(currentTile.eventType, newX, newY)
      }
    }
  }

  // 处理地图事件
  const handleMapEvent = (eventType, x, y) => {
    switch (eventType) {
      case 'monster':
        onMapEvent('battle', { x, y })
        break
      case 'treasure':
        onMapEvent('treasure', { x, y })
        break
      case 'dungeon':
        onMapEvent('dungeon', { x, y })
        break
      case 'shop':
        onMapEvent('shop', { x, y })
        break
    }
  }

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          e.preventDefault()
          movePlayer(0, -1)
          break
        case 'ArrowDown':
        case 's':
          e.preventDefault()
          movePlayer(0, 1)
          break
        case 'ArrowLeft':
        case 'a':
          e.preventDefault()
          movePlayer(-1, 0)
          break
        case 'ArrowRight':
        case 'd':
          e.preventDefault()
          movePlayer(1, 0)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [playerPos])

  return (
    <div className="space-y-4">
      <Card className="bg-black/40 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center gap-2">
            <Map className="w-5 h-5" />
            意图世界地图
          </CardTitle>
          <CardDescription className="text-gray-300">
            使用方向键或WASD移动 • 当前位置: ({playerPos.x}, {playerPos.y})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 地图显示区域 */}
          <div className="bg-black/20 p-4 rounded-lg">
            <div className="grid grid-cols-10 gap-1 max-w-md mx-auto">
              {Array.from({ length: viewSize }, (_, y) => 
                Array.from({ length: viewSize }, (_, x) => {
                  const mapX = viewOffset.x + x
                  const mapY = viewOffset.y + y
                  const tile = gameMap[mapY]?.[mapX]
                  const isPlayer = mapX === playerPos.x && mapY === playerPos.y
                  
                  if (!tile) return null
                  
                  return (
                    <div
                      key={`${mapX}-${mapY}`}
                      className={`
                        w-8 h-8 flex items-center justify-center text-xs rounded border
                        ${getTerrainColor(tile.type, tile.discovered)}
                        ${isPlayer ? 'ring-2 ring-red-500' : ''}
                        ${tile.hasEvent && tile.discovered ? 'ring-1 ring-yellow-400' : ''}
                      `}
                      title={tile.discovered ? `${tile.type} (${mapX}, ${mapY})` : '未探索'}
                    >
                      {isPlayer ? '🧙' : tile.discovered ? getTerrainIcon(tile.type) : '❓'}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* 移动控制按钮 */}
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={() => movePlayer(0, -1)}
              variant="outline"
              size="sm"
              className="w-12 h-12"
            >
              ↑
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={() => movePlayer(-1, 0)}
                variant="outline"
                size="sm"
                className="w-12 h-12"
              >
                ←
              </Button>
              <Button
                onClick={() => movePlayer(1, 0)}
                variant="outline"
                size="sm"
                className="w-12 h-12"
              >
                →
              </Button>
            </div>
            <Button
              onClick={() => movePlayer(0, 1)}
              variant="outline"
              size="sm"
              className="w-12 h-12"
            >
              ↓
            </Button>
          </div>

          {/* 地图图例 */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span>🏘️</span>
              <span>村庄</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🏛️</span>
              <span>城镇</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🌲</span>
              <span>森林</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⛰️</span>
              <span>山脉</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🌊</span>
              <span>湖泊</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🕳️</span>
              <span>洞穴</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-600">
            <Button onClick={onClose} variant="outline">
              关闭地图
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MapSystem

