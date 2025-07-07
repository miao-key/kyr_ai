import { useState, useCallback } from 'react'
import { callMoonshotAPI } from '../utils/apiUtils'
import { generateGameState } from '../utils/gameUtils'

export const useAI = () => {
  const [aiThinking, setAiThinking] = useState(false)
  const [isProcessingAI, setIsProcessingAI] = useState(false)

  // 生成AI发言
  const generateAISpeech = useCallback(async (player, gameState, playerList) => {
    const gameContext = `
当前游戏状态：
- 阶段：${gameState.phase}
- 天数：${gameState.day}
- 存活玩家：${gameState.alivePlayers.map(p => p.name).join(', ')}
- 死亡玩家：${gameState.deadPlayers.map(p => p.name).join(', ')}
- 最近日志：${gameState.recentLogs.map(log => log.message).join('; ')}
`

    let rolePrompt = ''
    switch (player.role) {
      case 'WEREWOLF':
        const teammates = playerList.filter(p => p.role === 'WEREWOLF' && p.id !== player.id && p.isAlive)
        rolePrompt = `你是狼人，你的队友是：${teammates.map(p => p.name).join(', ')}。你需要隐藏身份，可以谎报自己是其他角色来误导好人阵营。你的目标是消灭所有好人。发言策略：1)可以谎称自己是预言家、女巫等神职角色；2)制造混乱，误导好人的判断；3)保护队友，转移怀疑目标；4)表现得像一个正义的好人。`
        break
      case 'SEER':
        rolePrompt = '你是预言家，可以在夜晚查验玩家身份。你需要引导好人找出狼人，但要小心暴露身份。'
        break
      case 'WITCH':
        rolePrompt = '你是女巫，拥有解药和毒药。你需要合理使用技能帮助好人阵营获胜。'
        break
      case 'HUNTER':
        rolePrompt = '你是猎人，被投票出局时可以开枪。你需要威慑狼人，但要小心暴露身份。'
        break
      case 'VILLAGER':
        rolePrompt = '你是村民，没有特殊技能。你需要通过观察和推理找出狼人。'
        break
    }

    const personalityPrompt = `你的性格特点：${player.personality.type} - ${player.personality.traits}`

    const messages = [
      {
        role: 'system',
        content: `你是狼人杀游戏中的AI玩家。${rolePrompt} ${personalityPrompt} 请根据当前游戏状态发表一段简短的发言（50-100字），要符合你的角色身份和性格特点。`
      },
      {
        role: 'user',
        content: gameContext
      }
    ]

    try {
      const response = await callMoonshotAPI(messages, 0.8)
      return response
    } catch (error) {
      console.error('AI发言生成失败:', error)
      return '我需要仔细观察一下局势...'
    }
  }, [])

  // 生成AI投票
  const generateAIVote = useCallback(async (player, gameState, playerList) => {
    const alivePlayers = playerList.filter(p => p.isAlive && p.id !== player.id)
    
    if (alivePlayers.length === 0) return null

    const gameContext = `
当前游戏状态：
- 存活玩家：${alivePlayers.map(p => `${p.name}(#${p.id})`).join(', ')}
- 最近讨论和日志：${gameState.recentLogs.map(log => log.message).join('; ')}
`

    let rolePrompt = ''
    switch (player.role) {
      case 'WEREWOLF':
        const teammates = playerList.filter(p => p.role === 'WEREWOLF' && p.id !== player.id && p.isAlive)
        const nonWerewolfTargets = alivePlayers.filter(p => p.role !== 'WEREWOLF')
        rolePrompt = `你是狼人，队友：${teammates.map(p => p.name).join(', ')}。投票策略：1)优先投出神职玩家(预言家、女巫、猎人)；2)绝不投票给狼人队友；3)引导其他玩家跟你投票给好人；4)继续谎报身份，表现得像正义的好人。可投票目标：${nonWerewolfTargets.map(p => `${p.name}(#${p.id})`).join(', ')}`
        break
      case 'SEER':
        rolePrompt = '你是预言家，根据查验结果和观察投票给最可疑的狼人。'
        break
      case 'WITCH':
        rolePrompt = '你是女巫，根据夜晚信息和白天讨论投票给狼人。'
        break
      case 'HUNTER':
        rolePrompt = '你是猎人，投票给最可疑的狼人。'
        break
      case 'VILLAGER':
        rolePrompt = '你是村民，根据逻辑推理投票给最可疑的狼人。'
        break
    }

    const messages = [
      {
        role: 'system',
        content: `你是狼人杀游戏中的AI玩家。${rolePrompt} 请从存活玩家中选择一个投票目标，只需要回复玩家的ID数字（如：3）。`
      },
      {
        role: 'user',
        content: gameContext
      }
    ]

    try {
      const response = await callMoonshotAPI(messages, 0.7)
      const targetId = parseInt(response.match(/\d+/)?.[0])
      
      // 验证目标是否有效
      const validTarget = alivePlayers.find(p => p.id === targetId)
      if (validTarget) {
        // 狼人不能投票给队友
        if (player.role === 'WEREWOLF' && validTarget.role === 'WEREWOLF') {
          // 随机选择一个非狼人目标
          const nonWerewolfTargets = alivePlayers.filter(p => p.role !== 'WEREWOLF')
          return nonWerewolfTargets.length > 0 ? 
            nonWerewolfTargets[Math.floor(Math.random() * nonWerewolfTargets.length)].id :
            alivePlayers[0].id
        }
        return targetId
      }
      
      // 如果AI回复无效，随机选择
      return alivePlayers[Math.floor(Math.random() * alivePlayers.length)].id
    } catch (error) {
      console.error('AI投票生成失败:', error)
      // 随机投票
      return alivePlayers[Math.floor(Math.random() * alivePlayers.length)].id
    }
  }, [])

  // 处理AI夜晚行动
  const processAINightActions = useCallback(async (playerList, nightActions, setNightActions, addToLog) => {
    setIsProcessingAI(true)
    const newNightActions = { ...nightActions }
    
    // AI狼人行动 - 智能团队决策
    const aiWerewolves = playerList.filter(p => p.isAI && p.role === 'WEREWOLF' && p.isAlive)
    if (aiWerewolves.length > 0) {
      const targets = playerList.filter(p => p.isAlive && p.role !== 'WEREWOLF')
      if (targets.length > 0) {
        // 优先级：神职 > 村民，优先杀死威胁最大的玩家
        const priorityTargets = targets.filter(p => ['SEER', 'WITCH', 'HUNTER'].includes(p.role))
        const selectedTarget = priorityTargets.length > 0 ? 
          priorityTargets[Math.floor(Math.random() * priorityTargets.length)] :
          targets[Math.floor(Math.random() * targets.length)]
        
        newNightActions.werewolf_kill = selectedTarget.id
        addToLog(`狼人团队经过商议，选择了目标...`)
      }
    }
    
    // AI预言家行动
    const aiSeer = playerList.find(p => p.isAI && p.role === 'SEER' && p.isAlive)
    if (aiSeer) {
      const targets = playerList.filter(p => p.isAlive && p.id !== aiSeer.id)
      if (targets.length > 0) {
        const randomTarget = targets[Math.floor(Math.random() * targets.length)]
        newNightActions.seer_check = randomTarget.id
        const targetRole = playerList.find(p => p.id === randomTarget.id)?.role
        const isWerewolf = targetRole === 'WEREWOLF'
        addToLog(`预言家查验了${randomTarget.name}，结果是${isWerewolf ? '狼人' : '好人'}`)
      }
    }
    
    // AI女巫行动
    const aiWitch = playerList.find(p => p.isAI && p.role === 'WITCH' && p.isAlive)
    if (aiWitch && newNightActions.werewolf_kill) {
      // 30%概率救人
      if (Math.random() < 0.3) {
        newNightActions.witch_save = newNightActions.werewolf_kill
        addToLog('女巫使用了解药...')
      }
      // 20%概率毒人
      if (Math.random() < 0.2) {
        const targets = playerList.filter(p => p.isAlive && p.id !== aiWitch.id)
        if (targets.length > 0) {
          const randomTarget = targets[Math.floor(Math.random() * targets.length)]
          newNightActions.witch_poison = randomTarget.id
          addToLog('女巫使用了毒药...')
        }
      }
    }
    
    setNightActions(newNightActions)
    setIsProcessingAI(false)
    
    return newNightActions
  }, [])

  return {
    aiThinking,
    isProcessingAI,
    setAiThinking,
    setIsProcessingAI,
    generateAISpeech,
    generateAIVote,
    processAINightActions
  }
}