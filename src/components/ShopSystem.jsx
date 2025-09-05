import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ShoppingCart, Coins, Package, Sword, Shield, Gem } from 'lucide-react'

// 商店物品
const shopItems = {
  '治疗药水': {
    type: 'consumable',
    description: '恢复30点生命值',
    price: 15,
    icon: Package,
    stock: 10
  },
  '魔法卷轴': {
    type: 'consumable',
    description: '恢复20点魔法值',
    price: 25,
    icon: Package,
    stock: 8
  },
  '铁剑': {
    type: 'weapon',
    description: '比新手法杖更强的武器',
    price: 100,
    icon: Sword,
    stock: 3
  },
  '皮甲': {
    type: 'armor',
    description: '比布袍更好的防具',
    price: 80,
    icon: Shield,
    stock: 5
  },
  '力量戒指': {
    type: 'accessory',
    description: '增加力量的戒指',
    price: 150,
    icon: Gem,
    stock: 2
  },
  '智慧项链': {
    type: 'accessory',
    description: '增加智力的项链',
    price: 200,
    icon: Gem,
    stock: 1
  }
}

const ShopSystem = ({ player, onPlayerUpdate, onClose }) => {
  const [selectedTab, setSelectedTab] = useState('buy')

  // 购买物品
  const buyItem = (itemName) => {
    const item = shopItems[itemName]
    if (!item || player.gold < item.price) return

    const newInventory = [...player.inventory, itemName]
    const newGold = player.gold - item.price

    onPlayerUpdate({
      ...player,
      inventory: newInventory,
      gold: newGold
    })
  }

  // 出售物品
  const sellItem = (itemName) => {
    const itemIndex = player.inventory.indexOf(itemName)
    if (itemIndex === -1) return

    const newInventory = [...player.inventory]
    newInventory.splice(itemIndex, 1)
    
    // 出售价格是购买价格的一半
    const sellPrice = shopItems[itemName] ? Math.floor(shopItems[itemName].price / 2) : 5
    const newGold = player.gold + sellPrice

    onPlayerUpdate({
      ...player,
      inventory: newInventory,
      gold: newGold
    })
  }

  return (
    <div className="space-y-4">
      <Card className="bg-black/40 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            意图商店
          </CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2 text-yellow-400">
              <Coins className="w-4 h-4" />
              你的金币: {player.gold}
            </div>
          </CardDescription>
          <div className="flex gap-2">
            <Button
              onClick={() => setSelectedTab('buy')}
              variant={selectedTab === 'buy' ? 'default' : 'outline'}
              size="sm"
            >
              购买
            </Button>
            <Button
              onClick={() => setSelectedTab('sell')}
              variant={selectedTab === 'sell' ? 'default' : 'outline'}
              size="sm"
            >
              出售
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedTab === 'buy' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">商店物品</h3>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(shopItems).map(([itemName, item]) => {
                  const Icon = item.icon
                  const canAfford = player.gold >= item.price
                  
                  return (
                    <div key={itemName} className="flex items-center justify-between p-3 bg-black/20 rounded border">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <div>
                          <p className="font-medium">{itemName}</p>
                          <p className="text-xs text-gray-400">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-yellow-400">
                              {item.price} 金币
                            </Badge>
                            <Badge variant="secondary">
                              库存: {item.stock}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => buyItem(itemName)}
                        disabled={!canAfford || item.stock === 0}
                        size="sm"
                        variant={canAfford ? "default" : "outline"}
                      >
                        {!canAfford ? '金币不足' : item.stock === 0 ? '缺货' : '购买'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {selectedTab === 'sell' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">出售物品</h3>
              {player.inventory.length === 0 ? (
                <p className="text-gray-500">背包是空的</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {player.inventory.map((itemName, index) => {
                    const shopItem = shopItems[itemName]
                    const sellPrice = shopItem ? Math.floor(shopItem.price / 2) : 5
                    const Icon = shopItem ? shopItem.icon : Package
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded border">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <div>
                            <p className="font-medium">{itemName}</p>
                            {shopItem && (
                              <p className="text-xs text-gray-400">{shopItem.description}</p>
                            )}
                            <Badge variant="outline" className="text-green-400 mt-1">
                              出售价: {sellPrice} 金币
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => sellItem(itemName)}
                          size="sm"
                          variant="outline"
                        >
                          出售
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-600">
            <Button onClick={onClose} variant="outline">
              离开商店
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ShopSystem

