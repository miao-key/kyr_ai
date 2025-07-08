import { useState, useCallback } from 'react'

export const useNightActions = () => {
  const [nightActions, setNightActions] = useState({})
  const [seerResult, setSeerResult] = useState(null)
  const [witchUsedSave, setWitchUsedSave] = useState(false)
  const [witchUsedPoison, setWitchUsedPoison] = useState(false)
  const [hunterCanShoot, setHunterCanShoot] = useState(false)
  const [hunterTarget, setHunterTarget] = useState(null)

  // 处理夜晚行动
  const handleNightAction = useCallback((actionType, targetId, players, addToLog) => {
    setNightActions(prev => ({
      ...prev,
      [actionType]: targetId
    }))
    
    // 处理预言家查验
    if (actionType === 'seer_check') {
      const targetPlayer = players.find(p => p.id === targetId)
      if (targetPlayer) {
        const isWerewolf = targetPlayer.role === 'WEREWOLF'
        setSeerResult({
          playerName: targetPlayer.name,
          isWerewolf: isWerewolf
        })
        addToLog(`预言家查验了 ${targetPlayer.name}，结果是：${isWerewolf ? '狼人' : '好人'}`)
      }
    }
    
    // 处理女巫技能使用状态
    if (actionType === 'witch_save') {
      setWitchUsedSave(true)
      const targetPlayer = players.find(p => p.id === targetId)
      addToLog(`女巫对 ${targetPlayer?.name} 使用了解药`)
    }
    
    if (actionType === 'witch_poison') {
      setWitchUsedPoison(true)
      const targetPlayer = players.find(p => p.id === targetId)
      addToLog(`女巫对 ${targetPlayer?.name} 使用了毒药`)
    }
  }, [])

  // 处理夜晚结果
  const processNightActions = useCallback((players, addToLog) => {
    let newPlayers = [...players]
    let killedPlayers = []
    
    // 狼人杀人
    if (nightActions.werewolf_kill) {
      const targetId = nightActions.werewolf_kill
      // 检查女巫是否救人
      if (nightActions.witch_save !== targetId) {
        const killedPlayer = newPlayers.find(p => p.id === targetId)
        if (killedPlayer) {
          killedPlayer.isAlive = false
          killedPlayers.push(killedPlayer)
          addToLog(`${killedPlayer.name} 在夜晚被狼人杀死了`)
        }
      } else {
        addToLog('女巫救了被狼人攻击的玩家')
      }
    }
    
    // 女巫毒人
    if (nightActions.witch_poison) {
      const poisonTarget = newPlayers.find(p => p.id === nightActions.witch_poison)
      if (poisonTarget && poisonTarget.isAlive) {
        poisonTarget.isAlive = false
        killedPlayers.push(poisonTarget)
        addToLog(`${poisonTarget.name} 被女巫毒死了`)
      }
    }
    
    // 检查是否有猎人被杀
    const killedHunter = killedPlayers.find(p => p.role === 'HUNTER')
    if (killedHunter) {
      setHunterCanShoot(true)
      addToLog(`猎人 ${killedHunter.name} 被杀，可以开枪带走一名玩家`)
    }
    
    return { newPlayers, killedHunter: !!killedHunter }
  }, [nightActions])

  // 重置夜晚状态
  const resetNightState = useCallback(() => {
    setNightActions({})
    setSeerResult(null)
  }, [])

  return {
    // 状态
    nightActions,
    seerResult,
    witchUsedSave,
    witchUsedPoison,
    hunterCanShoot,
    hunterTarget,
    
    // 状态更新函数
    setNightActions,
    setHunterTarget,
    setHunterCanShoot,
    
    // 业务逻辑函数
    handleNightAction,
    processNightActions,
    resetNightState
  }
}
const [witchUsedSave, setWitchUsedSave] = useState(false)
const [witchUsedPoison, setWitchUsedPoison] = useState(false)