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

// 检查游戏是否结束 - 屠边胜利条件
export const checkGameEnd = (playerList) => {
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