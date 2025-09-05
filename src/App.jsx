import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Sword, Shield, Heart, Zap, Map, Package, Settings, Save } from 'lucide-react'
import BattleSystem from './components/BattleSystem.jsx'
import InventorySystem from './components/InventorySystem.jsx'
import ShopSystem from './components/ShopSystem.jsx'
import './App.css'

// 导入图片资源
import characterMage from './assets/images/character_mage.png'
import characterShrimp from './assets/images/character_shrimp_companion.png'
import monster1 from './assets/images/monster_1.png'
import monster2 from './assets/images/monster_2.png'
import monster3 from './assets/images/monster_3.png'
import monster4 from './assets/images/monster_4.png'
import monster5 from './assets/images/monster_5.png'

// 游戏状态管理
const initialGameState = {
  player: {
    name: '意图法师',
    level: 1,
    experience: 0,
    experienceToNext: 100,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    strength: 10,
    agility: 8,
    intelligence: 15,
    constitution: 12,
    skillPoints: 0,
    gold: 50,
    inventory: ['治疗药水', '魔法卷轴'],
    equipment: {
      weapon: '新手法杖',
      armor: '布袍',
      accessory: null
    },
    spells: ['火球术', '治疗术'],
    location: 'starting_village'
  },
  currentScene: 'intro',
  gameLog: [],
  companion: {
    name: '虾虾',
    present: false,
    health: 80,
    maxHealth: 80
  }
}

// 场景数据
const scenes = {
  intro: {
    title: '意图之境的召唤',
    description: `在Anoma的世界中，意图是一切的源泉。你是一名年轻的意图法师，刚刚觉醒了操控意图机器的能力。
    
    你站在新手村的中央，周围是熟悉的茅草屋和石板路。远处的地平线上，神秘的意图之塔若隐若现，那里据说隐藏着Anoma世界的终极秘密。
    
    你的导师告诉你，只有通过不断的冒险和战斗，才能提升你的意图操控能力，最终成为真正的意图大师。`,
    image: characterMage,
    choices: [
      { text: '前往村长家接受第一个任务', action: 'village_chief' },
      { text: '探索村庄周围的森林', action: 'forest_entrance' },
      { text: '查看个人状态和装备', action: 'character_status' },
      { text: '前往商店购买物品', action: 'shop' }
    ]
  },
  village_chief: {
    title: '村长的委托',
    description: `村长是一位慈祥的老人，他的眼中闪烁着智慧的光芒。当你走进他的房间时，他正在研究一张古老的地图。
    
    "年轻的意图法师，"村长抬起头看着你，"我们村庄最近遇到了麻烦。森林深处出现了一些奇怪的生物，它们似乎被某种扭曲的意图所驱动。
    
    我需要你去调查这件事，但首先，你需要一个伙伴。在村庄的东边，有一只名叫虾虾的神奇生物，它一直在等待合适的意图法师。"`,
    image: null,
    choices: [
      { text: '接受任务，前往寻找虾虾', action: 'find_companion' },
      { text: '询问更多关于森林生物的信息', action: 'forest_info' },
      { text: '要求先提升装备再出发', action: 'request_equipment' },
      { text: '返回村庄中心', action: 'intro' }
    ]
  },
  find_companion: {
    title: '遇见虾虾',
    description: `你来到村庄东边的小溪旁，这里水草丰茂，阳光透过树叶洒在水面上。突然，一个红色的身影从水中跃出！
    
    这就是虾虾——一只戴着蓝色帽子的神奇虾类生物。它的眼中闪烁着电光，似乎拥有某种特殊的能力。
    
    虾虾看到你后，兴奋地游到岸边，用它独特的方式与你交流。你感受到了一种奇妙的意图共鸣。`,
    image: characterShrimp,
    choices: [
      { text: '与虾虾建立意图连接', action: 'bond_companion' },
      { text: '先测试虾虾的能力', action: 'test_companion' },
      { text: '询问虾虾关于森林的情况', action: 'companion_info' },
      { text: '返回村长那里报告', action: 'village_chief' }
    ]
  },
  forest_entrance: {
    title: '神秘森林入口',
    description: `你来到了村庄外的森林边缘。这里的树木异常高大，枝叶茂密得几乎遮蔽了天空。
    
    空气中弥漫着一种奇特的能量波动，你的意图感知告诉你，这里隐藏着许多秘密。
    
    远处传来了奇怪的声音，似乎是某种生物在移动。你需要小心行事。`,
    image: null,
    choices: [
      { text: '深入森林探索', action: 'forest_deep' },
      { text: '在入口处搜索线索', action: 'search_entrance' },
      { text: '使用魔法感知周围', action: 'magic_sense' },
      { text: '返回村庄', action: 'intro' }
    ]
  }
}

function App() {
  const [gameState, setGameState] = useState(initialGameState)
  const [currentScene, setCurrentScene] = useState(scenes.intro)
  const [gameMode, setGameMode] = useState('story') // 'story', 'battle', 'inventory', 'shop'

  // 添加日志消息
  const addLog = (message) => {
    setGameState(prev => ({
      ...prev,
      gameLog: [...prev.gameLog.slice(-9), message] // 保持最新10条消息
    }))
  }

  // 处理选择
  const handleChoice = (action) => {
    switch (action) {
      case 'village_chief':
        setCurrentScene(scenes.village_chief)
        addLog('你前往村长家')
        break
      case 'forest_entrance':
        setCurrentScene(scenes.forest_entrance)
        addLog('你来到了森林入口')
        break
      case 'find_companion':
        setCurrentScene(scenes.find_companion)
        addLog('你开始寻找虾虾')
        break
      case 'bond_companion':
        setGameState(prev => ({
          ...prev,
          companion: { ...prev.companion, present: true }
        }))
        addLog('虾虾加入了你的队伍！')
        setCurrentScene(scenes.village_chief)
        break
      case 'character_status':
        setGameMode('inventory')
        addLog('你查看了自己的状态')
        break
      case 'shop':
        setGameMode('shop')
        addLog('你进入了商店')
        break
      case 'forest_deep':
        // 随机遭遇战斗
        if (Math.random() > 0.5) {
          setGameMode('battle')
          addLog('你遇到了敌人！')
        } else {
          addLog('你在森林中发现了一些有趣的东西...')
        }
        break
      case 'intro':
        setCurrentScene(scenes.intro)
        setGameMode('story')
        addLog('你回到了村庄中心')
        break
      default:
        addLog(`执行动作: ${action}`)
        break
    }
  }

  // 保存游戏
  const saveGame = () => {
    localStorage.setItem('anomaRpgSave', JSON.stringify(gameState))
    addLog('游戏已保存')
  }

  // 加载游戏
  const loadGame = () => {
    const saved = localStorage.getItem('anomaRpgSave')
    if (saved) {
      const loadedState = JSON.parse(saved)
      setGameState(loadedState)
      setCurrentScene(scenes[loadedState.currentScene] || scenes.intro)
      addLog('游戏已加载')
    }
  }

  // 战斗结束处理
  const handleBattleEnd = (result) => {
    setGameMode('story')
    if (result === 'victory') {
      addLog('战斗胜利！')
    } else if (result === 'defeat') {
      addLog('战斗失败...')
      // 可以添加死亡惩罚逻辑
    } else if (result === 'flee') {
      addLog('成功逃脱战斗')
    }
  }

  // 更新玩家状态
  const updatePlayer = (newPlayerState) => {
    setGameState(prev => ({
      ...prev,
      player: newPlayerState
    }))
  }

  useEffect(() => {
    // 游戏启动时尝试加载保存的游戏
    const saved = localStorage.getItem('anomaRpgSave')
    if (saved) {
      // 可以在这里添加加载确认对话框
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto p-4">
        {/* 游戏标题 */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Anoma RPG - 意图之境
          </h1>
          <p className="text-lg text-gray-300">基于Anoma世界观的深度剧情RPG</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：角色状态面板 */}
          <div className="space-y-4">
            {/* 角色信息 */}
            <Card className="bg-black/30 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                  <Sword className="w-5 h-5" />
                  {gameState.player.name}
                </CardTitle>
                <CardDescription>等级 {gameState.player.level} 意图法师</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* 生命值 */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      生命值
                    </span>
                    <span>{gameState.player.health}/{gameState.player.maxHealth}</span>
                  </div>
                  <Progress 
                    value={(gameState.player.health / gameState.player.maxHealth) * 100} 
                    className="h-2"
                  />
                </div>

                {/* 魔法值 */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-blue-500" />
                      魔法值
                    </span>
                    <span>{gameState.player.mana}/{gameState.player.maxMana}</span>
                  </div>
                  <Progress 
                    value={(gameState.player.mana / gameState.player.maxMana) * 100} 
                    className="h-2"
                  />
                </div>

                {/* 经验值 */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>经验值</span>
                    <span>{gameState.player.experience}/{gameState.player.experienceToNext}</span>
                  </div>
                  <Progress 
                    value={(gameState.player.experience / gameState.player.experienceToNext) * 100} 
                    className="h-2"
                  />
                </div>

                {/* 属性 */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>力量: {gameState.player.strength}</div>
                  <div>敏捷: {gameState.player.agility}</div>
                  <div>智力: {gameState.player.intelligence}</div>
                  <div>体质: {gameState.player.constitution}</div>
                </div>

                {/* 金币 */}
                <div className="text-yellow-400">
                  金币: {gameState.player.gold}
                </div>
              </CardContent>
            </Card>

            {/* 伙伴信息 */}
            {gameState.companion.present && (
              <Card className="bg-black/30 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-400">{gameState.companion.name}</CardTitle>
                  <CardDescription>意图伙伴</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        生命值
                      </span>
                      <span>{gameState.companion.health}/{gameState.companion.maxHealth}</span>
                    </div>
                    <Progress 
                      value={(gameState.companion.health / gameState.companion.maxHealth) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 快捷操作 */}
            <Card className="bg-black/30 border-gray-500/30">
              <CardHeader>
                <CardTitle className="text-gray-300">快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={saveGame} className="w-full" variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  保存游戏
                </Button>
                <Button onClick={loadGame} className="w-full" variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  加载游戏
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 中间：主要游戏区域 */}
          <div className="lg:col-span-2 space-y-4">
            {gameMode === 'story' && (
              <>
                {/* 场景显示 */}
                <Card className="bg-black/40 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">{currentScene.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 场景图片 */}
                    {currentScene.image && (
                      <div className="flex justify-center">
                        <img 
                          src={currentScene.image} 
                          alt={currentScene.title}
                          className="max-w-xs max-h-48 object-contain rounded-lg border-2 border-yellow-500/30"
                        />
                      </div>
                    )}

                    {/* 场景描述 */}
                    <div className="text-gray-200 leading-relaxed whitespace-pre-line">
                      {currentScene.description}
                    </div>

                    {/* 选择按钮 */}
                    <div className="space-y-2">
                      {currentScene.choices.map((choice, index) => (
                        <Button
                          key={index}
                          onClick={() => handleChoice(choice.action)}
                          className="w-full text-left justify-start"
                          variant="outline"
                        >
                          {choice.text}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {gameMode === 'battle' && (
              <BattleSystem
                player={gameState.player}
                companion={gameState.companion}
                onBattleEnd={handleBattleEnd}
                onPlayerUpdate={updatePlayer}
              />
            )}

            {gameMode === 'inventory' && (
              <InventorySystem
                player={gameState.player}
                onPlayerUpdate={updatePlayer}
                onClose={() => setGameMode('story')}
              />
            )}

            {gameMode === 'shop' && (
              <ShopSystem
                player={gameState.player}
                onPlayerUpdate={updatePlayer}
                onClose={() => setGameMode('story')}
              />
            )}

            {/* 游戏日志 */}
            <Card className="bg-black/30 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400">游戏日志</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-gray-300 max-h-32 overflow-y-auto">
                  {gameState.gameLog.length === 0 ? (
                    <p className="text-gray-500">暂无日志记录</p>
                  ) : (
                    gameState.gameLog.map((log, index) => (
                      <div key={index} className="border-l-2 border-green-500/30 pl-2">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

