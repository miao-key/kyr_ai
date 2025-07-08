import { AI_PERSONALITIES, ROLES } from '../constants/gameConstants'

// 生成AI个性
export const generateAIPersonality = () => {
  return AI_PERSONALITIES[Math.floor(Math.random() * AI_PERSONALITIES.length)]
}

// 生成游戏状态描述
export const generateGameState = (players, gamePhase, dayNumber, gameLog) => {
  const alivePlayers = players.filter(p => p.isAlive)
  const deadPlayers = players.filter(p => !p.isAlive)
  
  return {
    phase: gamePhase,
    day: dayNumber,
    alivePlayers: alivePlayers.map(p => ({ id: p.id, name: p.name })),
    deadPlayers: deadPlayers.map(p => ({ id: p.id, name: p.name })),
    recentLogs: gameLog.slice(-5)
  }
}

// 增强的游戏状态验证
export const validateGameState = (players, gamePhase, nightActions) => {
  const errors = []
  const warnings = []
  
  // 基本验证
  if (!players || players.length !== 9) {
    errors.push('玩家数量不正确')
  }
  
  const alivePlayers = players.filter(p => p.isAlive)
  const werewolves = alivePlayers.filter(p => p.role === 'WEREWOLF')
  const villagers = alivePlayers.filter(p => p.role !== 'WEREWOLF')
  
  // 游戏结束条件检查
  if (werewolves.length === 0 && gamePhase !== 'game_over') {
    warnings.push('所有狼人已死亡，游戏应该结束')
  }
  
  if (villagers.length === 0 && gamePhase !== 'game_over') {
    warnings.push('所有好人已死亡，游戏应该结束')
  }
  
  // 夜晚行动一致性检查
  if (gamePhase === 'night' && nightActions) {
    if (nightActions.werewolf_kill) {
      const target = players.find(p => p.id === nightActions.werewolf_kill)
      if (!target || !target.isAlive) {
        errors.push('狼人击杀目标无效')
      }
    }
    
    if (nightActions.witch_save && nightActions.witch_poison) {
      if (nightActions.witch_save === nightActions.witch_poison) {
        errors.push('女巫不能对同一目标同时使用解药和毒药')
      }
    }
  }
  
  return { isValid: errors.length === 0, errors, warnings }
}

// 在关键操作前调用验证
export const checkGameEnd = (playerList) => {
  const validation = validateGameState(playerList, 'checking')
  if (!validation.isValid) {
    console.error('游戏状态验证失败:', validation.errors)
  }
  
  const alivePlayers = playerList.filter(p => p.isAlive)
  const aliveWerewolves = alivePlayers.filter(p => p.role === 'WEREWOLF')
  const aliveVillagers = alivePlayers.filter(p => p.role === 'VILLAGER')
  const aliveGods = alivePlayers.filter(p => ['SEER', 'WITCH', 'HUNTER'].includes(p.role))
  
  if (aliveWerewolves.length === 0) {
    return { winner: 'villagers', message: '好人胜利！所有狼人已被消灭！' }
  } else if (aliveVillagers.length === 0 && aliveGods.length > 0) {
    return { winner: 'werewolves', message: '狼人胜利！屠边成功，所有平民已被消灭！' }
  } else if (aliveGods.length === 0 && aliveVillagers.length > 0) {
    return { winner: 'werewolves', message: '狼人胜利！屠边成功，所有神职已被消灭！' }
  } else if (aliveVillagers.length === 0 && aliveGods.length === 0) {
    return { winner: 'werewolves', message: '狼人胜利！屠边成功，所有好人已被消灭！' }
  } else if (aliveWerewolves.length >= (aliveVillagers.length + aliveGods.length)) {
    return { winner: 'werewolves', message: '狼人胜利！狼人数量已达到胜利条件！' }
  }
  return null
}

// 初始化玩家
export const initializePlayers = (customRoles, selectedRole, playerNames) => {
  const roleList = []
  Object.entries(ROLES).forEach(([roleKey, roleData]) => {
    for (let i = 0; i < roleData.count; i++) {
      roleList.push(roleKey)
    }
  })
  
  const shuffledRoles = roleList.sort(() => Math.random() - 0.5)
  const shuffledNames = [...playerNames].sort(() => Math.random() - 0.5)
  
  return Array.from({ length: 9 }, (_, index) => {
    const isHuman = shuffledNames[index] === '你'
    return {
      id: index + 1,
      name: shuffledNames[index],
      role: customRoles && selectedRole && isHuman ? selectedRole : shuffledRoles[index],
      isAlive: true,
      votes: 0,
      isAI: !isHuman,
      personality: !isHuman ? generateAIPersonality() : null
    }
  })
}