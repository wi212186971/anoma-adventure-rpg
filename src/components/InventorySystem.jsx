import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Package, Sword, Shield, Gem, Pill } from 'lucide-react'

// 物品数据
const items = {
  '治疗药水': {
    type: 'consumable',
    description: '恢复30点生命值',
    effect: { health: 30 },
    value: 15,
    icon: Pill
  },
  '魔法卷轴': {
    type: 'consumable',
    description: '恢复20点魔法值',
    effect: { mana: 20 },
    value: 25,
    icon: Package
  },
  '新手法杖': {
    type: 'weapon',
    description: '基础的魔法武器',
    stats: { attack: 8, intelligence: 2 },
    value: 50,
    icon: Sword
  },
  '布袍': {
    type: 'armor',
    description: '简单的布制防具',
    stats: { defense: 3, mana: 10 },
    value: 30,
    icon: Shield
  },
  '力量戒指': {
    type: 'accessory',
    description: '增加力量的戒指',
    stats: { strength: 3 },
    value: 100,
    icon: Gem
  },
  '智慧项链': {
    type: 'accessory',
    description: '增加智力的项链',
    stats: { intelligence: 5 },
    value: 150,
    icon: Gem
  }
}

const InventorySystem = ({ player, onPlayerUpdate, onClose }) => {
  const [selectedTab, setSelectedTab] = useState('inventory')

  // 使用物品
  const useItem = (itemName) => {
    const item = items[itemName]
    if (!item || item.type !== 'consumable') return

    const newInventory = [...player.inventory]
    const itemIndex = newInventory.indexOf(itemName)
    if (itemIndex === -1) return

    // 移除物品
    newInventory.splice(itemIndex, 1)

    // 应用效果
    let newHealth = player.health
    let newMana = player.mana

    if (item.effect.health) {
      newHealth = Math.min(player.maxHealth, player.health + item.effect.health)
    }
    if (item.effect.mana) {
      newMana = Math.min(player.maxMana, player.mana + item.effect.mana)
    }

    onPlayerUpdate({
      ...player,
      inventory: newInventory,
      health: newHealth,
      mana: newMana
    })
  }

  // 装备物品
  const equipItem = (itemName) => {
    const item = items[itemName]
    if (!item || item.type === 'consumable') return

    const newInventory = [...player.inventory]
    const newEquipment = { ...player.equipment }
    
    // 卸下当前装备
    if (item.type === 'weapon' && newEquipment.weapon) {
      newInventory.push(newEquipment.weapon)
    } else if (item.type === 'armor' && newEquipment.armor) {
      newInventory.push(newEquipment.armor)
    } else if (item.type === 'accessory' && newEquipment.accessory) {
      newInventory.push(newEquipment.accessory)
    }

    // 装备新物品
    const itemIndex = newInventory.indexOf(itemName)
    if (itemIndex !== -1) {
      newInventory.splice(itemIndex, 1)
      
      if (item.type === 'weapon') {
        newEquipment.weapon = itemName
      } else if (item.type === 'armor') {
        newEquipment.armor = itemName
      } else if (item.type === 'accessory') {
        newEquipment.accessory = itemName
      }

      onPlayerUpdate({
        ...player,
        inventory: newInventory,
        equipment: newEquipment
      })
    }
  }

  // 计算总属性
  const getTotalStats = () => {
    let totalStats = {
      attack: player.strength,
      defense: player.constitution,
      intelligence: player.intelligence,
      mana: player.maxMana
    }

    // 添加装备属性
    Object.values(player.equipment).forEach(equipName => {
      if (equipName && items[equipName] && items[equipName].stats) {
        const stats = items[equipName].stats
        Object.keys(stats).forEach(stat => {
          if (totalStats[stat] !== undefined) {
            totalStats[stat] += stats[stat]
          }
        })
      }
    })

    return totalStats
  }

  const totalStats = getTotalStats()

  return (
    <div className="space-y-4">
      <Card className="bg-black/40 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <Package className="w-5 h-5" />
            物品管理
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setSelectedTab('inventory')}
              variant={selectedTab === 'inventory' ? 'default' : 'outline'}
              size="sm"
            >
              背包
            </Button>
            <Button
              onClick={() => setSelectedTab('equipment')}
              variant={selectedTab === 'equipment' ? 'default' : 'outline'}
              size="sm"
            >
              装备
            </Button>
            <Button
              onClick={() => setSelectedTab('stats')}
              variant={selectedTab === 'stats' ? 'default' : 'outline'}
              size="sm"
            >
              属性
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedTab === 'inventory' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">背包物品</h3>
              {player.inventory.length === 0 ? (
                <p className="text-gray-500">背包是空的</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {player.inventory.map((itemName, index) => {
                    const item = items[itemName]
                    if (!item) return null
                    
                    const Icon = item.icon
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-black/20 rounded border">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{itemName}</p>
                            <p className="text-xs text-gray-400">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {item.type === 'consumable' ? (
                            <Button
                              onClick={() => useItem(itemName)}
                              size="sm"
                              variant="outline"
                            >
                              使用
                            </Button>
                          ) : (
                            <Button
                              onClick={() => equipItem(itemName)}
                              size="sm"
                              variant="outline"
                            >
                              装备
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'equipment' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">当前装备</h3>
              <div className="space-y-3">
                {Object.entries(player.equipment).map(([slot, equipName]) => {
                  const item = equipName ? items[equipName] : null
                  const Icon = item ? item.icon : Package
                  
                  return (
                    <div key={slot} className="flex items-center justify-between p-2 bg-black/20 rounded border">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <div>
                          <p className="font-medium capitalize">{slot === 'weapon' ? '武器' : slot === 'armor' ? '防具' : '饰品'}</p>
                          <p className="text-sm text-gray-400">
                            {equipName || '未装备'}
                          </p>
                        </div>
                      </div>
                      {item && (
                        <div className="text-xs text-green-400">
                          {Object.entries(item.stats || {}).map(([stat, value]) => (
                            <div key={stat}>
                              {stat === 'attack' ? '攻击' : 
                               stat === 'defense' ? '防御' : 
                               stat === 'intelligence' ? '智力' : 
                               stat === 'mana' ? '魔法' : stat}: +{value}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {selectedTab === 'stats' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">角色属性</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2 bg-black/20 rounded">
                    <p className="text-sm text-gray-400">基础力量</p>
                    <p className="text-lg font-bold">{player.strength}</p>
                  </div>
                  <div className="p-2 bg-black/20 rounded">
                    <p className="text-sm text-gray-400">基础敏捷</p>
                    <p className="text-lg font-bold">{player.agility}</p>
                  </div>
                  <div className="p-2 bg-black/20 rounded">
                    <p className="text-sm text-gray-400">基础智力</p>
                    <p className="text-lg font-bold">{player.intelligence}</p>
                  </div>
                  <div className="p-2 bg-black/20 rounded">
                    <p className="text-sm text-gray-400">基础体质</p>
                    <p className="text-lg font-bold">{player.constitution}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-600 pt-2 mt-4">
                  <h4 className="font-semibold mb-2 text-green-400">总属性（含装备）</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-2 bg-green-900/20 rounded">
                      <p className="text-sm text-gray-400">总攻击力</p>
                      <p className="text-lg font-bold text-green-400">{totalStats.attack}</p>
                    </div>
                    <div className="p-2 bg-blue-900/20 rounded">
                      <p className="text-sm text-gray-400">总防御力</p>
                      <p className="text-lg font-bold text-blue-400">{totalStats.defense}</p>
                    </div>
                    <div className="p-2 bg-purple-900/20 rounded">
                      <p className="text-sm text-gray-400">总智力</p>
                      <p className="text-lg font-bold text-purple-400">{totalStats.intelligence}</p>
                    </div>
                    <div className="p-2 bg-cyan-900/20 rounded">
                      <p className="text-sm text-gray-400">总魔法值</p>
                      <p className="text-lg font-bold text-cyan-400">{totalStats.mana}</p>
                    </div>
                  </div>
                </div>

                {player.skillPoints > 0 && (
                  <div className="border-t border-gray-600 pt-2 mt-4">
                    <h4 className="font-semibold mb-2 text-yellow-400">可用技能点: {player.skillPoints}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => {
                          onPlayerUpdate({
                            ...player,
                            strength: player.strength + 1,
                            skillPoints: player.skillPoints - 1
                          })
                        }}
                        disabled={player.skillPoints === 0}
                        size="sm"
                        variant="outline"
                      >
                        +1 力量
                      </Button>
                      <Button
                        onClick={() => {
                          onPlayerUpdate({
                            ...player,
                            agility: player.agility + 1,
                            skillPoints: player.skillPoints - 1
                          })
                        }}
                        disabled={player.skillPoints === 0}
                        size="sm"
                        variant="outline"
                      >
                        +1 敏捷
                      </Button>
                      <Button
                        onClick={() => {
                          onPlayerUpdate({
                            ...player,
                            intelligence: player.intelligence + 1,
                            skillPoints: player.skillPoints - 1
                          })
                        }}
                        disabled={player.skillPoints === 0}
                        size="sm"
                        variant="outline"
                      >
                        +1 智力
                      </Button>
                      <Button
                        onClick={() => {
                          onPlayerUpdate({
                            ...player,
                            constitution: player.constitution + 1,
                            maxHealth: player.maxHealth + 5,
                            skillPoints: player.skillPoints - 1
                          })
                        }}
                        disabled={player.skillPoints === 0}
                        size="sm"
                        variant="outline"
                      >
                        +1 体质
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              关闭
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InventorySystem

