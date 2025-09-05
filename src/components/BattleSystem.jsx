import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Sword, Shield, Heart, Zap, Target } from 'lucide-react'

// 怪物数据
const monsters = {
  forest_slime: {
    name: '森林史莱姆',
    health: 30,
    maxHealth: 30,
    attack: 8,
    defense: 2,
    experience: 15,
    gold: 10,
    image: '/src/assets/images/monster_1.png',
    description: '一只绿色的史莱姆，在森林中游荡。'
  },
  shadow_wolf: {
    name: '暗影狼',
    health: 45,
    maxHealth: 45,
    attack: 12,
    defense: 4,
    experience: 25,
    gold: 18,
    image: '/src/assets/images/monster_2.png',
    description: '被黑暗力量侵蚀的狼，眼中闪烁着红光。'
  },
  crystal_golem: {
    name: '水晶魔像',
    health: 80,
    maxHealth: 80,
    attack: 15,
    defense: 8,
    experience: 40,
    gold: 35,
    image: '/src/assets/images/monster_3.png',
    description: '由魔法水晶构成的巨大魔像，移动缓慢但攻击力强大。'
  }
}

const BattleSystem = ({ player, companion, onBattleEnd, onPlayerUpdate }) => {
  const [currentMonster, setCurrentMonster] = useState(() => {
    // 随机选择一个怪物
    const monsterKeys = Object.keys(monsters)
    const randomKey = monsterKeys[Math.floor(Math.random() * monsterKeys.length)]
    return { ...monsters[randomKey], id: randomKey }
  })
  
  const [battleLog, setBattleLog] = useState([])
  const [playerTurn, setPlayerTurn] = useState(true)
  const [battleEnded, setBattleEnded] = useState(false)

  // 添加战斗日志
  const addBattleLog = (message) => {
    setBattleLog(prev => [...prev.slice(-4), message])
  }

  // 计算伤害
  const calculateDamage = (attacker, defender) => {
    const baseDamage = attacker.attack
    const defense = defender.defense || 0
    const damage = Math.max(1, baseDamage - defense + Math.floor(Math.random() * 5) - 2)
    return damage
  }

  // 玩家攻击
  const playerAttack = () => {
    if (!playerTurn || battleEnded) return

    const damage = calculateDamage(player, currentMonster)
    const newMonsterHealth = Math.max(0, currentMonster.health - damage)
    
    setCurrentMonster(prev => ({ ...prev, health: newMonsterHealth }))
    addBattleLog(`你对${currentMonster.name}造成了${damage}点伤害！`)

    if (newMonsterHealth <= 0) {
      // 怪物死亡
      addBattleLog(`${currentMonster.name}被击败了！`)
      addBattleLog(`获得${currentMonster.experience}经验值和${currentMonster.gold}金币！`)
      
      // 更新玩家状态
      const newExp = player.experience + currentMonster.experience
      const newGold = player.gold + currentMonster.gold
      let newLevel = player.level
      let newExpToNext = player.experienceToNext
      let newSkillPoints = player.skillPoints

      // 检查升级
      if (newExp >= player.experienceToNext) {
        newLevel += 1
        newExpToNext = newLevel * 100 // 简单的升级公式
        newSkillPoints += 3
        addBattleLog(`恭喜！你升到了${newLevel}级！获得3技能点！`)
      }

      onPlayerUpdate({
        ...player,
        experience: newExp,
        experienceToNext: newExpToNext,
        level: newLevel,
        gold: newGold,
        skillPoints: newSkillPoints
      })

      setBattleEnded(true)
      setTimeout(() => onBattleEnd('victory'), 2000)
      return
    }

    setPlayerTurn(false)
    // 怪物回合
    setTimeout(monsterAttack, 1000)
  }

  // 使用魔法
  const useMagic = (spellName) => {
    if (!playerTurn || battleEnded || player.mana < 10) return

    let damage = 0
    let manaCost = 10

    switch (spellName) {
      case '火球术':
        damage = player.intelligence + Math.floor(Math.random() * 10)
        addBattleLog(`你施放了火球术！`)
        break
      case '治疗术':
        const healAmount = Math.min(player.intelligence + 5, player.maxHealth - player.health)
        onPlayerUpdate({
          ...player,
          health: player.health + healAmount,
          mana: player.mana - manaCost
        })
        addBattleLog(`你使用治疗术恢复了${healAmount}点生命值！`)
        setPlayerTurn(false)
        setTimeout(monsterAttack, 1000)
        return
      default:
        return
    }

    const newMonsterHealth = Math.max(0, currentMonster.health - damage)
    setCurrentMonster(prev => ({ ...prev, health: newMonsterHealth }))
    addBattleLog(`对${currentMonster.name}造成了${damage}点魔法伤害！`)

    onPlayerUpdate({
      ...player,
      mana: player.mana - manaCost
    })

    if (newMonsterHealth <= 0) {
      addBattleLog(`${currentMonster.name}被击败了！`)
      addBattleLog(`获得${currentMonster.experience}经验值和${currentMonster.gold}金币！`)
      
      const newExp = player.experience + currentMonster.experience
      const newGold = player.gold + currentMonster.gold
      let newLevel = player.level
      let newExpToNext = player.experienceToNext
      let newSkillPoints = player.skillPoints

      if (newExp >= player.experienceToNext) {
        newLevel += 1
        newExpToNext = newLevel * 100
        newSkillPoints += 3
        addBattleLog(`恭喜！你升到了${newLevel}级！获得3技能点！`)
      }

      onPlayerUpdate({
        ...player,
        experience: newExp,
        experienceToNext: newExpToNext,
        level: newLevel,
        gold: newGold,
        skillPoints: newSkillPoints,
        mana: player.mana - manaCost
      })

      setBattleEnded(true)
      setTimeout(() => onBattleEnd('victory'), 2000)
      return
    }

    setPlayerTurn(false)
    setTimeout(monsterAttack, 1000)
  }

  // 怪物攻击
  const monsterAttack = () => {
    if (battleEnded) return

    const damage = calculateDamage(currentMonster, player)
    const newPlayerHealth = Math.max(0, player.health - damage)
    
    onPlayerUpdate({
      ...player,
      health: newPlayerHealth
    })
    
    addBattleLog(`${currentMonster.name}对你造成了${damage}点伤害！`)

    if (newPlayerHealth <= 0) {
      addBattleLog('你被击败了...')
      setBattleEnded(true)
      setTimeout(() => onBattleEnd('defeat'), 2000)
      return
    }

    setPlayerTurn(true)
  }

  // 逃跑
  const flee = () => {
    if (!playerTurn || battleEnded) return
    
    const fleeChance = Math.random()
    if (fleeChance > 0.3) {
      addBattleLog('你成功逃脱了！')
      setBattleEnded(true)
      setTimeout(() => onBattleEnd('flee'), 1000)
    } else {
      addBattleLog('逃跑失败！')
      setPlayerTurn(false)
      setTimeout(monsterAttack, 1000)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-black/40 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400 text-center">战斗中</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 怪物信息 */}
          <div className="text-center">
            <img 
              src={currentMonster.image} 
              alt={currentMonster.name}
              className="w-32 h-32 mx-auto object-contain rounded-lg border-2 border-red-500/30 mb-2"
            />
            <h3 className="text-xl font-bold text-red-400">{currentMonster.name}</h3>
            <p className="text-sm text-gray-300 mb-2">{currentMonster.description}</p>
            
            {/* 怪物血条 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  生命值
                </span>
                <span>{currentMonster.health}/{currentMonster.maxHealth}</span>
              </div>
              <Progress 
                value={(currentMonster.health / currentMonster.maxHealth) * 100} 
                className="h-3"
              />
            </div>
          </div>

          {/* 战斗日志 */}
          <Card className="bg-black/20 border-gray-500/30">
            <CardHeader>
              <CardTitle className="text-sm text-gray-300">战斗日志</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-gray-300 max-h-24 overflow-y-auto">
                {battleLog.length === 0 ? (
                  <p className="text-gray-500">战斗开始！</p>
                ) : (
                  battleLog.map((log, index) => (
                    <div key={index} className="border-l-2 border-red-500/30 pl-2">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 战斗操作 */}
          {!battleEnded && (
            <div className="space-y-2">
              <div className="text-center text-sm text-yellow-400 mb-2">
                {playerTurn ? '你的回合' : '敌人回合...'}
              </div>
              
              {playerTurn && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={playerAttack}
                      className="flex items-center gap-2"
                      variant="destructive"
                    >
                      <Sword className="w-4 h-4" />
                      攻击
                    </Button>
                    <Button 
                      onClick={flee}
                      className="flex items-center gap-2"
                      variant="outline"
                    >
                      <Target className="w-4 h-4" />
                      逃跑
                    </Button>
                  </div>
                  
                  {/* 魔法技能 */}
                  <div className="space-y-1">
                    <p className="text-sm text-blue-400">魔法技能:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {player.spells.map((spell, index) => (
                        <Button
                          key={index}
                          onClick={() => useMagic(spell)}
                          disabled={player.mana < 10}
                          className="flex items-center gap-2 text-xs"
                          variant="outline"
                          size="sm"
                        >
                          <Zap className="w-3 h-3" />
                          {spell}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BattleSystem

