import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import './App.css'
import { ROLES, GAME_PHASES, PLAYER_NAMES } from './constants/gameConstants'
import { callMoonshotAPI } from './utils/apiUtils'
import { generateGameState, generateAIPersonality, checkGameEnd, initializePlayers } from './utils/gameUtils'
import { useGameState } from './hooks/useGameState'
import { useNightActions } from './hooks/useNightActions'

// 使用memo优化组件渲染
const PlayerCard = memo(({ player, canSeeRole, isTeammate }) => {
  return (
    <div className={`player-card ${!player.isAlive ? 'dead' : ''} ${isTeammate ? 'werewolf-teammate' : ''}`}>
      <div className="player-name">{player.name}</div>
      <div className="player-role">
        {canSeeRole ? ROLES[player.role].name : '未知'}
        {isTeammate && <span className="teammate-indicator"> 🐺</span>}
      </div>
      <div className="player-status">
        {player.isAlive ? '存活' : '死亡'}
      </div>
    </div>
  )
})

function App() {
  // 使用统一的状态管理
  const gameState = useGameState()
  const nightActionsHook = useNightActions()
  
  // 保留必要的本地状态
  const [customRoles, setCustomRoles] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [userSpeech, setUserSpeech] = useState('')
  const [currentActionTimeout, setCurrentActionTimeout] = useState(null)
  
  // 添加缺失的本地状态（不与hooks冲突的）
  const [currentNightRole, setCurrentNightRole] = useState(null)
  const [nightTimer, setNightTimer] = useState(0)
  const [nightActionComplete, setNightActionComplete] = useState(false)
  const [nightPhaseIndex, setNightPhaseIndex] = useState(0)
  const [seerHasChecked, setSeerHasChecked] = useState(false)
  const [votingResults, setVotingResults] = useState({})
  const [aiThinking, setAiThinking] = useState(false)
  const [currentSpeaker, setCurrentSpeaker] = useState(null)
  const [dayDiscussion, setDayDiscussion] = useState([])
  const [isProcessingAI, setIsProcessingAI] = useState(false)
  const [waitingForUserSpeech, setWaitingForUserSpeech] = useState(false)
  const [votes, setVotes] = useState({})
  
  // 使用useRef管理定时器
  const timeoutRef = useRef(null)
  const intervalRef = useRef(null)
  
  // 清理定时器的hook
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
  
  // 从hooks中解构状态（只解构实际存在的）
  const {
    gamePhase, setGamePhase,
    players, setPlayers,
    currentPlayer, setCurrentPlayer,
    gameLog, setGameLog,
    dayNumber, setDayNumber,
    winner, setWinner,
    addToLog
  } = gameState
  
  const {
    nightActions, setNightActions,
    seerResult, setSeerResult,
    witchUsedSave, setWitchUsedSave,
    witchUsedPoison, setWitchUsedPoison,
    hunterCanShoot, setHunterCanShoot,
    hunterTarget, setHunterTarget,
    handleNightAction,
    processNightActions,
    resetNightState
  } = nightActionsHook

  // 使用useMemo缓存计算结果
  const gameStats = useMemo(() => {
    const alivePlayers = players.filter(p => p.isAlive)
    const werewolves = alivePlayers.filter(p => p.role === 'WEREWOLF')
    const villagers = alivePlayers.filter(p => p.role !== 'WEREWOLF')
    
    return { alivePlayers, werewolves, villagers }
  }, [players])
  
  // 使用useCallback缓存函数
  const handlePlayerAction = useCallback((actionType, targetId) => {
    if (currentNightRole === 'SEER' && actionType === 'seer_check') {
      executeNightAction('SEER', targetId, currentPlayer)
    } else if (currentNightRole === 'WEREWOLF' && actionType === 'werewolf_kill') {
      executeNightAction('WEREWOLF', targetId, currentPlayer)
    } else if (currentNightRole === 'WITCH') {
      if (actionType === 'witch_save') {
        executeNightAction('WITCH', { save: targetId, poison: null }, currentPlayer)
      } else if (actionType === 'witch_poison') {
        executeNightAction('WITCH', { save: null, poison: targetId }, currentPlayer)
      }
    }
  }, [currentNightRole, currentPlayer])
  
  // 批量状态更新
  const resetGameState = useCallback(() => {
    setGamePhase(GAME_PHASES.LOBBY)
    setPlayers([])
    setCurrentPlayer(null)
    setGameLog([])
    setNightActions({})
    setDayNumber(1)
    setVotingResults({})
    setWinner(null)
    setAiThinking(false)
    setCurrentSpeaker(null)
    setDayDiscussion([])
    setIsProcessingAI(false)
    setUserSpeech('')
    setWaitingForUserSpeech(false)
    setSeerResult(null)
    setWitchUsedSave(false)
    setWitchUsedPoison(false)
    setHunterCanShoot(false)
    setHunterTarget(null)
    setVotes({})
    setSeerHasChecked(false)
    setCurrentNightRole(null)
    setNightTimer(0)
    setNightActionComplete(false)
    setNightPhaseIndex(0)
    resetNightState()
  }, [
    setGamePhase, setPlayers, setCurrentPlayer, setGameLog, setNightActions,
    setDayNumber, setWinner, setSeerResult, setWitchUsedSave, setWitchUsedPoison,
    setHunterCanShoot, setHunterTarget, resetNightState
  ])

  // 夜晚行动顺序
  const NIGHT_ACTION_ORDER = ['WEREWOLF', 'SEER', 'WITCH']

  // 生成游戏状态描述
  const getGameState = () => {
    return generateGameState(players, gamePhase, dayNumber, gameLog)
  }

  // 初始化游戏
  const initializeGame = () => {
    const newPlayers = initializePlayers(customRoles, selectedRole, PLAYER_NAMES)
    
    setPlayers(newPlayers)
    setCurrentPlayer(newPlayers.find(p => p.name === '你')) // 找到真人玩家
    setGamePhase(GAME_PHASES.NIGHT)
    setDayDiscussion([])
    setVotes({})
    setVotingResults({})
    setWitchUsedSave(false)
    setWitchUsedPoison(false)
    setHunterCanShoot(false)
    setSeerResult(null)
    setSeerHasChecked(false)
    setNightActions({})
    setGameLog([])
    setDayNumber(1)
    setWinner(null)
    setAiThinking(false)
    setCurrentSpeaker(null)
    setIsProcessingAI(false)
    setUserSpeech('')
    setWaitingForUserSpeech(false)
    setHunterTarget(null)
    setCurrentNightRole(null)
    setNightTimer(0)
    setNightActionComplete(false)
    setNightPhaseIndex(0)
    addToLog('游戏开始！第1夜降临...')
    
    // 开始夜晚行动流程
    setTimeout(() => {
      startNightActions()
    }, 1000)
  }



  // 检查游戏是否结束 - 屠边胜利条件
  const handleGameEnd = (playerList = players) => {
    const result = checkGameEnd(playerList)
    if (result.gameEnded) {
      setWinner(result.winner)
      setGamePhase(GAME_PHASES.GAME_OVER)
      addToLog(result.message)
      return true
    }
    return false
  }

  // 开始夜晚行动流程
  const startNightActions = () => {
    setNightPhaseIndex(0)
    setCurrentNightRole(null)
    setNightActionComplete(false)
    processNextNightRole()
  }

  // 添加游戏状态验证函数
  const validateGameState = () => {
    const alivePlayers = players.filter(p => p.isAlive)
    const werewolves = alivePlayers.filter(p => p.role === 'WEREWOLF')
    const villagers = alivePlayers.filter(p => p.role !== 'WEREWOLF')
    
    if (werewolves.length === 0 || villagers.length === 0) {
      console.warn('游戏状态异常：某一方已全部死亡但游戏未结束')
      return false
    }
    
    return true
  }

  // 处理下一个夜晚角色行动
  const processNextNightRole = () => {
    if (!validateGameState()) {
      handleGameEnd(players)
      return
    }
    
    if (nightPhaseIndex >= NIGHT_ACTION_ORDER.length) {
      // 所有夜晚行动完成，处理夜晚结果
      processNightActions()
      return
    }
    
    const roleType = NIGHT_ACTION_ORDER[nightPhaseIndex]
    const rolePlayer = players.find(p => p.role === roleType && p.isAlive)
    
    if (!rolePlayer) {
      // 该角色玩家已死亡，2秒后跳过
      addToLog(`${getRoleName(roleType)}已死亡，跳过行动`)
      setTimeout(() => {
        setNightPhaseIndex(prev => prev + 1)
        processNextNightRole()
      }, 2000)
      return
    }
    
    setCurrentNightRole(roleType)
    setNightActionComplete(false)
    
    if (rolePlayer.isAI) {
      // AI玩家行动
      handleAINightAction(rolePlayer, roleType)
    } else {
      // 用户行动，启动10秒倒计时
      startUserNightTimer(rolePlayer, roleType)
    }
  }

  // 获取角色名称
  const getRoleName = (roleType) => {
    const roleNames = {
      'WEREWOLF': '狼人',
      'SEER': '预言家', 
      'WITCH': '女巫'
    }
    return roleNames[roleType] || roleType
  }

  // 处理AI夜晚行动
  const handleAINightAction = (player, roleType) => {
    if (!player || !player.isAlive) {
      console.warn('AI玩家无效或已死亡，跳过行动')
      setNightPhaseIndex(prev => prev + 1)
      processNextNightRole()
      return
    }
    
    // 清理之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setAiThinking(true)
    addToLog(`${player.name}(${getRoleName(roleType)})正在思考...`)
    
    timeoutRef.current = setTimeout(async () => {
      try {
        const action = await generateAINightAction(player, roleType)
        if (action) {
          executeNightAction(roleType, action, player)
        } else {
          executeDefaultNightAction(roleType, player)
        }
      } catch (error) {
        console.error('AI夜晚行动失败:', error)
        executeDefaultNightAction(roleType, player)
      } finally {
        setAiThinking(false)
        setNightPhaseIndex(prev => prev + 1)
        processNextNightRole()
      }
    }, 3000)
  }

  // 启动用户夜晚行动计时器
  const startUserNightTimer = (userPlayer, roleType) => {
    addToLog(`轮到${userPlayer.name}(${getRoleName(roleType)})行动，请在10秒内完成选择`)
    
    // 清理之前的定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    let timeLeft = 10
    setNightTimer(timeLeft)
    
    intervalRef.current = setInterval(() => {
      timeLeft--
      setNightTimer(timeLeft)
      
      if (timeLeft <= 0 || nightActionComplete) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        
        if (!nightActionComplete) {
          // 超时，执行默认行动
          executeDefaultNightAction(roleType, userPlayer)
        }
        
        // 进入下一阶段
        setTimeout(() => {
          setNightPhaseIndex(prev => prev + 1)
          processNextNightRole()
        }, 1000)
      }
    }, 1000)
  }

  // 生成AI夜晚行动决策
  const generateAINightAction = async (aiPlayer, roleType) => {
    const alivePlayers = players.filter(p => p.isAlive)
    
    switch (roleType) {
      case 'WEREWOLF':
        return await generateWerewolfKillTarget(aiPlayer, alivePlayers)
      case 'SEER':
        return await generateSeerCheckTarget(aiPlayer, alivePlayers)
      case 'WITCH':
        const killTarget = nightActions.werewolf_kill
        return await generateWitchActions(aiPlayer, alivePlayers, killTarget)
      default:
        return null
    }
  }

  // 执行夜晚行动
  const executeNightAction = (roleType, actionData, player) => {
    // 添加状态验证
    if (!player || !player.isAlive) {
      console.warn('尝试执行已死亡玩家的夜晚行动')
      return
    }
    
    if (currentNightRole !== roleType) {
      console.warn('夜晚行动角色不匹配')
      return
    }
    
    switch (roleType) {
      case 'WEREWOLF':
        if (actionData) {
          setNightActions(prev => ({ ...prev, werewolf_kill: actionData }))
          addToLog(`狼人行动完成`)
        }
        break
        
      case 'SEER':
        if (actionData) {
          const targetPlayer = players.find(p => p.id === actionData)
          if (targetPlayer) {
            const isWerewolf = targetPlayer.role === 'WEREWOLF'
            setSeerResult({
              playerName: targetPlayer.name,
              isWerewolf: isWerewolf
            })
            setSeerHasChecked(true)
            addToLog(`预言家行动完成`)
          }
        }
        break
        
      case 'WITCH':
        if (actionData) {
          if (actionData.save) {
            setNightActions(prev => ({ ...prev, witch_save: actionData.save }))
            setWitchUsedSave(true)
          }
          if (actionData.poison) {
            setNightActions(prev => ({ ...prev, witch_poison: actionData.poison }))
            setWitchUsedPoison(true)
          }
          addToLog(`女巫行动完成`)
        }
        break
    }
    
    setNightActionComplete(true)
    
    // 确保状态更新后再进行下一步
    setTimeout(() => {
      setNightPhaseIndex(prev => prev + 1)
      processNextNightRole()
    }, 100)
  }

  // 执行默认夜晚行动（超时处理）
  const executeDefaultNightAction = (roleType, player) => {
    switch (roleType) {
      case 'WEREWOLF':
        // 随机选择击杀目标
        const targets = players.filter(p => p.isAlive && p.role !== 'WEREWOLF')
        if (targets.length > 0) {
          const randomTarget = targets[Math.floor(Math.random() * targets.length)]
          executeNightAction(roleType, randomTarget.id, player)
        }
        break
        
      case 'SEER':
        // 随机选择查验目标
        const checkTargets = players.filter(p => p.isAlive && p.id !== player.id)
        if (checkTargets.length > 0) {
          const randomTarget = checkTargets[Math.floor(Math.random() * checkTargets.length)]
          executeNightAction(roleType, randomTarget.id, player)
        }
        break
        
      case 'WITCH':
        // 不使用技能
        executeNightAction(roleType, { save: null, poison: null }, player)
        break
    }
    
    addToLog(`${player.name}行动超时，执行默认选择`)
  }

  // 获取角色显示名称
  const getRoleDisplayName = (role) => {
    const roleNames = {
      'WEREWOLF': '狼人',
      'SEER': '预言家', 
      'WITCH': '女巫'
    }
    return roleNames[role] || role
  }

  // AI夜晚行动处理 - 基于高级策略的智能决策（保留原有逻辑作为备用）
  const processAINightActions = async (playerList = players) => {
    setIsProcessingAI(true)
    const newNightActions = { ...nightActions }
    
    // AI狼人行动 - 基于专业击杀优先级策略
    const aiWerewolves = playerList.filter(p => p.isAI && p.role === 'WEREWOLF' && p.isAlive)
    if (aiWerewolves.length > 0) {
      const targetId = await generateWerewolfKillTarget(aiWerewolves[0], playerList)
      if (targetId) {
        newNightActions.werewolf_kill = targetId
        addToLog(`狼人团队经过深度战术分析，选择了击杀目标...`)
      }
    }
    
    // AI预言家行动 - 基于查验策略
    const aiSeer = playerList.find(p => p.isAI && p.role === 'SEER' && p.isAlive)
    if (aiSeer) {
      const targetId = await generateSeerCheckTarget(aiSeer, playerList)
      if (targetId) {
        newNightActions.seer_check = targetId
        const targetRole = playerList.find(p => p.id === targetId)?.role
        const isWerewolf = targetRole === 'WEREWOLF'
        addToLog(`预言家基于战术考量查验了目标，结果是${isWerewolf ? '狼人' : '好人'}`)
      }
    }
    
    // AI女巫行动 - 基于专业用药策略
    const aiWitch = playerList.find(p => p.isAI && p.role === 'WITCH' && p.isAlive)
    if (aiWitch) {
      const witchActions = await generateWitchActions(aiWitch, playerList, newNightActions.werewolf_kill)
      if (witchActions.save) {
        newNightActions.witch_save = witchActions.save
        addToLog('女巫经过战术分析，使用了解药...')
      }
      if (witchActions.poison) {
        newNightActions.witch_poison = witchActions.poison
        addToLog('女巫基于排水策略，使用了毒药...')
      }
    }
    
    setNightActions(newNightActions)
    setIsProcessingAI(false)
    
    // 如果玩家不是特殊角色或已死亡，自动进入白天
    const humanPlayer = playerList.find(p => !p.isAI)
    if (!humanPlayer?.isAlive || 
        (humanPlayer.role !== 'WEREWOLF' && humanPlayer.role !== 'SEER' && humanPlayer.role !== 'WITCH')) {
      setTimeout(() => processNightActions(), 3000)
    }
  }

  // 生成狼人击杀目标
  const generateWerewolfKillTarget = async (werewolfPlayer, alivePlayers) => {
    const targets = alivePlayers.filter(p => p.role !== 'WEREWOLF' && p.isAlive)
    if (targets.length === 0) return null
    
    try {
      const gameState = getGameState()
      const prompt = `你是狼人${werewolfPlayer.name}，个性：${werewolfPlayer.personality}。
      当前游戏状态：${gameState}
      可击杀目标：${targets.map(p => `${p.name}(${p.isAI ? 'AI' : '真人'})`).join(', ')}
      
      请选择最佳击杀目标，只返回目标的ID数字。`
      
      const response = await callMoonshotAPI(prompt)
      const targetId = parseInt(response.trim())
      
      if (targets.find(p => p.id === targetId)) {
        return targetId
      }
    } catch (error) {
      console.error('AI狼人决策失败:', error)
    }
    
    // 降级方案：随机选择
    return targets[Math.floor(Math.random() * targets.length)].id
  }

  // 智能击杀目标选择（降级方案）
  const getSmartKillTarget = (targets) => {
    // 按专业优先级排序
    const witchTargets = targets.filter(p => p.role === 'WITCH')
    if (witchTargets.length > 0) return witchTargets[0].id
    
    const seerTargets = targets.filter(p => p.role === 'SEER')
    if (seerTargets.length > 0) return seerTargets[0].id
    
    const hunterTargets = targets.filter(p => p.role === 'HUNTER')
    if (hunterTargets.length > 0 && Math.random() > 0.3) return hunterTargets[0].id // 30%概率避免击杀猎人
    
    const villagerTargets = targets.filter(p => p.role === 'VILLAGER')
    return villagerTargets.length > 0 ? villagerTargets[0].id : targets[0].id
  }

  // 生成预言家查验目标
  const generateSeerCheckTarget = async (seerPlayer, alivePlayers) => {
    const targets = alivePlayers.filter(p => p.id !== seerPlayer.id && p.isAlive)
    if (targets.length === 0) return null
    
    try {
      const gameState = getGameState()
      const prompt = `你是预言家${seerPlayer.name}，个性：${seerPlayer.personality}。
      当前游戏状态：${gameState}
      可查验目标：${targets.map(p => `${p.name}(${p.isAI ? 'AI' : '真人'})`).join(', ')}
      
      请选择最佳查验目标，只返回目标的ID数字。`
      
      const response = await callMoonshotAPI(prompt)
      const targetId = parseInt(response.trim())
      
      if (targets.find(p => p.id === targetId)) {
        return targetId
      }
    } catch (error) {
      console.error('AI预言家决策失败:', error)
    }
    
    // 降级方案：随机选择
    return targets[Math.floor(Math.random() * targets.length)].id
  }

  // 生成女巫行动决策
  const generateWitchActions = async (witchPlayer, alivePlayers, killTarget) => {
    try {
      const gameState = getGameState()
      const canSave = !witchUsedSave && killTarget
      const canPoison = !witchUsedPoison
      
      if (!canSave && !canPoison) {
        return { save: null, poison: null }
      }
      
      const prompt = `你是女巫${witchPlayer.name}，个性：${witchPlayer.personality}。
      当前游戏状态：${gameState}
      今晚狼人击杀目标：${killTarget ? players.find(p => p.id === killTarget)?.name : '无'}
      可用技能：${canSave ? '解药' : ''}${canSave && canPoison ? '、' : ''}${canPoison ? '毒药' : ''}
      
      请决定是否使用技能，格式：{"save": 目标ID或null, "poison": 目标ID或null}`
      
      const response = await callMoonshotAPI(prompt)
      return JSON.parse(response.trim())
    } catch (error) {
      console.error('AI女巫决策失败:', error)
      return { save: null, poison: null }
    }
  }

  // 智能女巫用药（降级方案）
  const getSmartWitchActions = (killedPlayer, alivePlayers) => {
    const result = { save: null, poison: null }
    
    // 救人逻辑：优先救神职
    if (killedPlayer) {
      const shouldSave = ['SEER', 'HUNTER'].includes(killedPlayer.role) || 
                        (killedPlayer.role === 'VILLAGER' && Math.random() < 0.3)
      if (shouldSave) {
        result.save = killedPlayer.id
      }
    }
    
    // 毒人逻辑：随机选择但避免毒神职
    if (Math.random() < 0.4) {
      const targets = alivePlayers.filter(p => 
        p.id !== result.save && !['SEER', 'WITCH', 'HUNTER'].includes(p.role)
      )
      if (targets.length > 0) {
        result.poison = targets[Math.floor(Math.random() * targets.length)].id
      }
    }
    
    return result
  }

  // 修改原有的handleNightAction函数
  const handleNightAction = useCallback((actionType, targetId) => {
    handlePlayerAction(actionType, targetId)
  }, [handlePlayerAction])



  // 添加检查夜晚行动是否完成的函数
  const checkNightActionsComplete = () => {
    if (!currentPlayer) return false
    
    // 根据当前玩家角色检查必要行动是否完成
    switch (currentPlayer.role) {
      case 'WEREWOLF':
        return nightActions.werewolf_kill !== undefined
      case 'SEER':
        return seerHasChecked
      case 'WITCH':
        // 女巫可以选择不使用技能，所以总是可以结束
        return true
      default:
        return true
    }
  }

  // 处理夜晚结果
  const processNightActions = () => {
    // 检查必要的夜晚行动是否完成
    if (!checkNightActionsComplete()) {
      let missingAction = ''
      if (currentPlayer?.role === 'WEREWOLF' && !nightActions.werewolf_kill) {
        missingAction = '狼人必须选择击杀目标'
      } else if (currentPlayer?.role === 'SEER' && !seerHasChecked) {
        missingAction = '预言家必须进行查验'
      }
      
      addToLog(`无法结束夜晚：${missingAction}`)
      return
    }
    
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
      setPlayers(newPlayers)
      setNightActions({})
      setSeerResult(null)
      setSeerHasChecked(false) // 重置预言家查验状态
      return // 暂停游戏流程，等待猎人开枪
    }
    
    setPlayers(newPlayers)
    setNightActions({})
    setSeerResult(null)
    setSeerHasChecked(false) // 重置预言家查验状态
    
    // 检查游戏是否结束
    setTimeout(() => {
      const gameEnded = handleGameEnd(newPlayers)
      
      // 如果游戏没有结束，进入白天讨论
      if (!gameEnded) {
        setGamePhase(GAME_PHASES.DAY)
        setDayDiscussion([])
        addToLog(`第${dayNumber}天白天开始，请大家发言讨论`)
        
        // 开始AI白天发言
        setTimeout(() => startDayDiscussion(newPlayers), 2000)
      }
    }, 500)
  }

  // 开始白天讨论 - 按ID顺序发言
  const startDayDiscussion = async (playerList = players) => {
    if (!validateGameState()) {
      handleGameEnd(playerList)
      return
    }
    
    const alivePlayers = playerList.filter(p => p.isAlive).sort((a, b) => a.id - b.id)
    
    // 所有存活玩家按顺序发言
    for (let i = 0; i < alivePlayers.length; i++) {
      const currentPlayer = alivePlayers[i]
      setCurrentSpeaker(currentPlayer.id)
      
      if (currentPlayer.isAI) {
        setAiThinking(true)
        try {
          const gameState = getGameState()
          const speech = await generateAISpeech(currentPlayer, gameState, playerList)
          
          setDayDiscussion(prev => [...prev, {
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            speech,
            timestamp: new Date().toLocaleTimeString()
          }])
          
          addToLog(`${currentPlayer.name}: ${speech}`)
        } catch (error) {
          console.error('AI发言生成失败:', error)
          const fallbackSpeech = `我觉得需要仔细分析一下昨天的情況...`
          
          setDayDiscussion(prev => [...prev, {
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            speech: fallbackSpeech,
            timestamp: new Date().toLocaleTimeString()
          }])
          
          addToLog(`${currentPlayer.name}: ${fallbackSpeech}`)
        }
        setAiThinking(false)
        
        // AI发言后等待2秒
        await new Promise(resolve => setTimeout(resolve, 2000))
      } else {
         // 真人玩家发言，等待用户输入
         setWaitingForUserSpeech(true)
         addToLog(`轮到 ${currentPlayer.name} 发言，请在下方输入您的发言内容`)
         return // 等待用户发言
       }
    }
    
    setCurrentSpeaker(null)
    addToLog('所有玩家发言完毕，准备进入投票阶段')
  }

  // 生成AI发言 - 基于专业策略的智能发言
  const generateAISpeech = async (aiPlayer, gameState, playerList) => {
    const rolePrompt = {
      WEREWOLF: `你是狼人，目标是屠边胜利。基于专业狼人策略：\n1. 可以悍跳预言家争夺话语权\n2. 深水狼要合理质疑，避免盲从\n3. 隐藏真实身份，可谎报为村民、预言家、女巫或猎人\n4. 保护狼人队友，引导投票投出好人\n5. 制造混乱和怀疑，利用逻辑漏洞误导好人\n6. 分析局势，在关键时刻可以出卖队友自保`,
      VILLAGER: `你是村民，目标是找出所有狼人。基于专业村民策略：\n1. 积极发言分析，这是村民最重要的武器\n2. 通过逻辑分析其他玩家的发言和行为\n3. 寻找发言矛盾、逻辑漏洞\n4. 可以适当挡刀，伪装神职保护真神\n5. 跟随坐实的神职玩家投票`,
      SEER: `你是预言家，拥有查验信息。基于专业预言家策略：\n1. 必须争取话语权，不能退缩\n2. 面对悍跳狼要坚定表达正确信息\n3. 合理透露查验信息引导好人\n4. 防止被狼人发现身份\n5. 建立查验逻辑链，证明身份真实性`,
      WITCH: `你是女巫，拥有药剂信息。基于专业女巫策略：\n1. 你是好人阵营最强神职，拥有归票权\n2. 要隐藏身份，避免过早暴露\n3. 根据夜晚用药情况合理发言\n4. 在关键时刻可以跳出来指挥局势\n5. 帮助好人阵营获胜`,
      HUNTER: `你是猎人，拥有开枪技能。基于专业猎人策略：\n1. 前期要隐藏身份，观察收集信息\n2. 谨慎发言，在关键时刻发挥作用\n3. 确定狼人身份后可以适时起跳\n4. 考虑开枪连带效应，选择最优目标\n5. 跟随女巫等神职玩家的指挥`
    }
    
    // 收集历史发言和投票信息
    const previousSpeeches = dayDiscussion.map(d => `${d.playerName}: ${d.speech}`).join('\n')
    const gameHistory = gameLog.slice(-10).map(log => log.message).join('\n')
    
    // 狼人的特殊发言策略
    const werewolfStrategy = aiPlayer.role === 'WEREWOLF' ? 
      '\n\n狼人高级策略：\n1. 可以悍跳预言家，与真预言家对跳\n2. 深水狼要合理质疑警长和神职\n3. 制造对好人的怀疑，特别是真正的神职\n4. 保护狼人队友，转移注意力\n5. 利用逻辑漏洞误导好人\n6. 表现得像无辜的好人，建立可信度\n7. 在关键时刻可以出卖队友获取信任' : ''
    
    const messages = [
      {
        role: 'system',
        content: `你正在玩狼人杀游戏，胜利条件是屠边。${rolePrompt[aiPlayer.role]} 你的个性是${aiPlayer.personality.type}：${aiPlayer.personality.traits}。${werewolfStrategy}\n\n请基于专业策略进行发言：\n1. 分析其他玩家的发言逻辑\n2. 观察投票行为模式\n3. 结合夜晚死亡情况\n4. 做出对你阵营最有利的发言\n5. 建立逻辑链，增强可信度\n\n发言要求：逻辑清晰（100字以内），符合角色策略，体现专业水平。`
      },
      {
        role: 'user',
        content: `游戏状态：第${gameState.day}天白天\n存活玩家：${gameState.alivePlayers.map(p => p.name).join('、')}\n死亡玩家：${gameState.deadPlayers.map(p => p.name).join('、')}\n\n今日发言记录：\n${previousSpeeches || '暂无发言'}\n\n游戏历史：\n${gameHistory}\n\n请基于专业策略发言：`
      }
    ]
    
    return await callMoonshotAPI(messages, 0.8)
  }

  // AI投票逻辑
  const processAIVoting = async () => {
    if (!validateGameState()) {
      handleGameEnd(players)
      return
    }
    
    setIsProcessingAI(true)
    const alivePlayers = players.filter(p => p.isAlive)
    const aiPlayers = alivePlayers.filter(p => p.isAI)
    
    addToLog('AI玩家开始投票...')
    
    for (const aiPlayer of aiPlayers) {
      const gameState = getGameState()
    const voteTargetId = await generateAIVote(aiPlayer, gameState, players)
      
      if (voteTargetId) {
        setVotes(prev => ({ ...prev, [aiPlayer.id]: voteTargetId }))
        const targetPlayer = alivePlayers.find(p => p.id === voteTargetId)
        if (targetPlayer) {
          addToLog(`${aiPlayer.name} 投票给了 ${targetPlayer.name}`)
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    
    setIsProcessingAI(false)
    addToLog('AI投票完成，等待真人玩家投票')
  }

  // 用户发言提交
  const submitUserSpeech = async () => {
    if (!userSpeech.trim()) return
    
    const currentPlayer = players.find(p => p.id === currentSpeaker)
    if (!currentPlayer) return
    
    // 添加用户发言到讨论记录
    setDayDiscussion(prev => [...prev, {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      speech: userSpeech.trim(),
      timestamp: new Date().toLocaleTimeString()
    }])
    
    addToLog(`${currentPlayer.name}: ${userSpeech.trim()}`)
    setUserSpeech('')
    setWaitingForUserSpeech(false)
    
    // 继续下一个玩家发言
    const alivePlayers = players.filter(p => p.isAlive).sort((a, b) => a.id - b.id)
    const currentIndex = alivePlayers.findIndex(p => p.id === currentSpeaker)
    
    if (currentIndex < alivePlayers.length - 1) {
      // 还有其他玩家需要发言
      const nextPlayerIndex = currentIndex + 1
      const nextPlayer = alivePlayers[nextPlayerIndex]
      setCurrentSpeaker(nextPlayer.id)
      
      if (nextPlayer.isAI) {
        setAiThinking(true)
        const gameState = getGameState()
        const speech = await generateAISpeech(nextPlayer, gameState, players)
        
        setDayDiscussion(prev => [...prev, {
          playerId: nextPlayer.id,
          playerName: nextPlayer.name,
          speech,
          timestamp: new Date().toLocaleTimeString()
        }])
        
        addToLog(`${nextPlayer.name}: ${speech}`)
        setAiThinking(false)
        
        // 继续处理剩余AI玩家
        setTimeout(() => {
          continueAIDiscussion(nextPlayerIndex + 1, alivePlayers)
        }, 2000)
      } else {
        // 下一个也是真人玩家
        setWaitingForUserSpeech(true)
        addToLog(`轮到 ${nextPlayer.name} 发言，请在下方输入您的发言内容`)
      }
    } else {
      // 所有玩家发言完毕
      setCurrentSpeaker(null)
      addToLog('所有玩家发言完毕，准备进入投票阶段')
      // 自动进入投票阶段
      setTimeout(() => {
        setGamePhase(GAME_PHASES.VOTING)
        processAIVoting()
      }, 2000)
    }
  }
  
  // 继续AI讨论
  const continueAIDiscussion = async (startIndex, alivePlayers) => {
    for (let i = startIndex; i < alivePlayers.length; i++) {
      const currentPlayer = alivePlayers[i]
      setCurrentSpeaker(currentPlayer.id)
      
      if (currentPlayer.isAI) {
        setAiThinking(true)
        try {
          const gameState = getGameState()
          const speech = await generateAISpeech(currentPlayer, gameState, players)
          
          setDayDiscussion(prev => [...prev, {
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            speech,
            timestamp: new Date().toLocaleTimeString()
          }])
          
          addToLog(`${currentPlayer.name}: ${speech}`)
        } catch (error) {
          console.error('AI发言生成失败:', error)
          const fallbackSpeech = `我需要再想想...`
          
          setDayDiscussion(prev => [...prev, {
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            speech: fallbackSpeech,
            timestamp: new Date().toLocaleTimeString()
          }])
          
          addToLog(`${currentPlayer.name}: ${fallbackSpeech}`)
        }
        setAiThinking(false)
        
        await new Promise(resolve => setTimeout(resolve, 2000))
      } else {
        // 遇到真人玩家，停止并等待
        setWaitingForUserSpeech(true)
        addToLog(`轮到 ${currentPlayer.name} 发言，请在下方输入您的发言内容`)
        return
      }
    }
    
    // 所有玩家发言完毕
    setCurrentSpeaker(null)
    addToLog('所有玩家发言完毕，准备进入投票阶段')
    // 自动进入投票阶段
    setTimeout(() => {
      setGamePhase(GAME_PHASES.VOTING)
      processAIVoting()
    }, 2000)
  }

  // 生成AI投票 - 基于专业策略的智能投票
  const generateAIVote = async (aiPlayer, gameState, playerList) => {
    const alivePlayers = playerList.filter(p => p.isAlive)
    const targets = alivePlayers.filter(p => p.id !== aiPlayer.id)
    if (targets.length === 0) return null
    
    const rolePrompt = {
      WEREWOLF: `你是狼人，基于专业狼人投票策略：\n1. 优先投出神职玩家（预言家、女巫、猎人）\n2. 避免投票给狼人队友\n3. 可以继续谎报身份制造混乱\n4. 引导其他玩家跟投好人\n5. 表现得像正义的好人在投狼人\n6. 合理质疑，避免盲从\n7. 在关键时刻可以出卖队友获取信任`,
      VILLAGER: `你是村民，基于专业村民投票策略：\n1. 分析发言逻辑，投票给最可疑的狼人\n2. 注意发言矛盾、逻辑漏洞\n3. 跟随坐实的神职玩家投票\n4. 观察投票行为模式\n5. 积极参与讨论和分析`,
      SEER: `你是预言家，基于专业预言家投票策略：\n1. 利用查验信息指导投票\n2. 投出已查验的狼人\n3. 保护查验的好人\n4. 建立权威，引导好人跟投\n5. 防止被狼人发现身份`,
      WITCH: `你是女巫，基于专业女巫投票策略：\n1. 作为最强神职，拥有归票权\n2. 结合药剂使用情况分析投票\n3. 指挥好人阵营投票\n4. 帮助好人阵营获胜\n5. 综合分析局势做出最优决策`,
      HUNTER: `你是猎人，基于专业猎人投票策略：\n1. 谨慎分析后投票\n2. 考虑开枪连带效应\n3. 选择最优投票目标\n4. 跟随神职玩家的指挥\n5. 在关键时刻发挥作用`
    }
    
    // 收集发言和历史信息
    const todaySpeeches = dayDiscussion.map(d => `${d.playerName}: ${d.speech}`).join('\n')
    const gameHistory = gameLog.slice(-15).map(log => log.message).join('\n')
    
    const messages = [
      {
        role: 'system',
        content: `你正在玩狼人杀投票阶段，胜利条件是屠边。${rolePrompt[aiPlayer.role]} 你的个性是${aiPlayer.personality.type}：${aiPlayer.personality.traits}。\n\n请基于专业投票策略选择目标：\n1. 分析每个玩家的发言逻辑\n2. 结合夜晚死亡信息\n3. 观察行为模式和投票倾向\n4. 选择对你阵营最有利的投票\n5. 考虑投票后的局势变化\n\n只返回要投票的玩家姓名，不要解释原因。`
      },
      {
        role: 'user',
        content: `投票阶段 - 第${gameState.day}天\n\n可投票玩家：${targets.map(p => p.name).join('、')}\n\n今日发言记录：\n${todaySpeeches || '暂无发言'}\n\n游戏历史：\n${gameHistory}\n\n请基于专业策略选择投票目标（只返回姓名）：`
      }
    ]
    
    try {
      const response = await callMoonshotAPI(messages, 0.6)
      const targetName = response.trim()
      const target = targets.find(p => p.name.includes(targetName) || targetName.includes(p.name))
      return target ? target.id : targets[Math.floor(Math.random() * targets.length)].id
    } catch {
      return targets[Math.floor(Math.random() * targets.length)].id
    }
  }


  
  // 投票
  const handleVote = (voterId, targetId) => {
    setVotes(prev => ({
      ...prev,
      [voterId]: targetId
    }))
  }

  // 处理投票结果
  const processVoting = () => {
    if (!validateGameState()) {
      handleGameEnd(players)
      return
    }
    
    const voteCount = {}
    Object.values(votes).forEach(targetId => {
      voteCount[targetId] = (voteCount[targetId] || 0) + 1
    })
    
    const maxVotes = Math.max(...Object.values(voteCount))
    const eliminatedIds = Object.keys(voteCount).filter(id => voteCount[id] === maxVotes)
    
    let newPlayers = [...players]
    
    if (eliminatedIds.length === 1) {
      const eliminatedPlayer = newPlayers.find(p => p.id === parseInt(eliminatedIds[0]))
      eliminatedPlayer.isAlive = false
      addToLog(`${eliminatedPlayer.name}(${ROLES[eliminatedPlayer.role].name}) 被投票出局`)
      
      // 猎人技能
      if (eliminatedPlayer.role === 'HUNTER') {
        setPlayers(newPlayers)
        setHunterCanShoot(true)
        addToLog(`猎人 ${eliminatedPlayer.name} 被投票出局，可以开枪带走一名玩家`)
        return // 等待猎人选择开枪目标
      }
    } else {
      addToLog('投票平票，无人出局')
    }
    
    setPlayers(newPlayers)
    setVotes({})
    
    // 检查游戏是否结束
    const gameEnded = handleGameEnd(newPlayers)
    
    // 如果游戏没有结束，进入下一轮
    if (!gameEnded) {
      // 修复：使用回调确保状态更新完成
      setDayNumber(prev => {
        const newDayNumber = prev + 1
        setGamePhase(GAME_PHASES.NIGHT)
        addToLog(`第${newDayNumber}夜降临...`)
        
        setTimeout(() => startNightActions(), 2000)
        return newDayNumber
      })
    }
  }
  
  // 猎人开枪
  const handleHunterShoot = (targetId) => {
    let newPlayers = [...players]
    const targetPlayer = newPlayers.find(p => p.id === targetId)
    if (targetPlayer) {
      targetPlayer.isAlive = false
      addToLog(`猎人开枪带走了 ${targetPlayer.name}(${ROLES[targetPlayer.role].name})`)
      setHunterCanShoot(false)
      setHunterTarget(null)
      setPlayers(newPlayers)
      
      // 检查游戏是否结束
      const gameEnded = handleGameEnd(newPlayers)
      
      // 如果游戏没有结束，继续正常流程
      if (!gameEnded) {
        if (gamePhase === GAME_PHASES.NIGHT) {
          // 如果在夜晚阶段，进入白天讨论
          setGamePhase(GAME_PHASES.DAY)
          addToLog(`第${dayNumber}天白天开始，请大家发言讨论`)
          setTimeout(() => startDayDiscussion(), 1000)
        } else if (gamePhase === GAME_PHASES.VOTING) {
          // 如果在投票阶段，进入夜晚
          setGamePhase(GAME_PHASES.NIGHT)
          const nextDay = dayNumber + 1
          setDayNumber(nextDay)
          addToLog(`第${nextDay}天夜晚开始`)
          setTimeout(() => startNightActions(), 2000)
        }
      }
    }
  }

  // useEffect(() => {
  //   if (players.length > 0) {
  //     checkGameEnd()
  //   }
  // }, [players])

  return (
    <div className="werewolf-game">
      <header className="game-header">
        <h1>🐺 狼人杀 - 9人标准局</h1>
        <div className="game-info">
          <span>阶段: {gamePhase === GAME_PHASES.LOBBY ? '准备中' : 
                      gamePhase === GAME_PHASES.NIGHT ? '夜晚' :
                      gamePhase === GAME_PHASES.DAY ? '白天' :
                      gamePhase === GAME_PHASES.VOTING ? '投票' : '游戏结束'}</span>
          {dayNumber > 0 && <span>第{dayNumber}天</span>}
        </div>
      </header>

      {gamePhase === GAME_PHASES.LOBBY && (
        <div className="lobby">
          <div className="role-config">
            <h2>角色配置</h2>
            <div className="roles-list">
              {Object.entries(ROLES).map(([key, role]) => (
                <div key={key} className="role-item">
                  <span className="role-name">{role.name}</span>
                  <span className="role-count">×{role.count}</span>
                  <span className="role-desc">{role.description}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="game-options">
            <div className="custom-role-option">
              <label>
                <input 
                  type="checkbox" 
                  checked={customRoles} 
                  onChange={(e) => setCustomRoles(e.target.checked)}
                />
                自定义身份
              </label>
              {customRoles && (
                <div className="role-selection">
                  <h4>选择你的身份：</h4>
                  <div className="role-buttons">
                    {Object.entries(ROLES).map(([key, role]) => (
                      <button 
                        key={key}
                        className={`role-btn ${selectedRole === key ? 'selected' : ''}`}
                        onClick={() => setSelectedRole(key)}
                      >
                        {role.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="game-features">
            <h3>游戏特色</h3>
            <ul>
              <li>🎲 随机打乱玩家位置，增加游戏趣味性</li>
              <li>🤖 AI智能发言，基于角色和游戏状态进行推理</li>
              <li>🎯 屠边胜利条件，更加刺激的游戏体验</li>
              <li>⚙️ 可自定义身份，体验不同角色的乐趣</li>
              <li>🐺 狼人团队协作，可看到队友身份并共同决策</li>
              <li>🎭 AI狼人智能谎报身份，增强游戏策略性</li>
            </ul>
          </div>
          
          <button 
            className="start-game-btn" 
            onClick={initializeGame}
            disabled={customRoles && !selectedRole}
          >
            开始游戏
          </button>
        </div>
      )}

      {gamePhase !== GAME_PHASES.LOBBY && (
        <div className="game-content">
          <div className="players-grid">
            <h3>玩家状态</h3>
            <div className="players-list">
              {players.map(player => {
                // 狼人可以看到队友身份
                const canSeeRole = currentPlayer?.id === player.id || 
                  (currentPlayer?.role === 'WEREWOLF' && player.role === 'WEREWOLF')
                const isTeammate = currentPlayer?.role === 'WEREWOLF' && player.role === 'WEREWOLF' && player.id !== currentPlayer.id
                
                return (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    canSeeRole={canSeeRole}
                    isTeammate={isTeammate}
                  />
                )
              })}
            </div>
          </div>

          {currentPlayer && (
            <div className="current-player-info">
              <h3>你的身份</h3>
              <div className="role-card">
                <div className="role-name">{ROLES[currentPlayer.role].name}</div>
                <div className="role-description">{ROLES[currentPlayer.role].description}</div>
              </div>
            </div>
          )}

          {gamePhase === GAME_PHASES.NIGHT && (
            <div className="night-actions">
              <h3>夜晚行动</h3>
              
              {/* 显示当前行动角色和倒计时 */}
              {currentNightRole && (
                <div className="current-night-phase">
                  <h4>当前阶段：{getRoleName(currentNightRole)}行动</h4>
                  {nightTimer > 0 && currentPlayer && !currentPlayer.isAI && (
                    <div className="night-timer">
                      <span>剩余时间：{nightTimer}秒</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* 狼人行动界面 */}
              {currentNightRole === 'WEREWOLF' && currentPlayer?.role === 'WEREWOLF' && (
                <div className="action-section">
                  <div className="werewolf-team-info">
                    <h4>🐺 狼人团队</h4>
                    <div className="werewolf-teammates">
                      {players.filter(p => p.role === 'WEREWOLF' && p.isAlive).map(wolf => (
                        <div key={wolf.id} className={`teammate ${wolf.id === currentPlayer.id ? 'current-player' : ''}`}>
                          <span className="teammate-name">{wolf.name}</span>
                          {wolf.id === currentPlayer.id && <span className="you-indicator">(你)</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <h4>选择杀死的玩家</h4>
                  <div className="target-buttons">
                    {players.filter(p => p.isAlive && p.role !== 'WEREWOLF').map(player => (
                      <button 
                        key={player.id} 
                        onClick={() => handleNightAction('werewolf_kill', player.id)}
                        disabled={nightActionComplete}
                      >
                        {player.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 预言家行动界面 */}
              {currentNightRole === 'SEER' && currentPlayer?.role === 'SEER' && (
                <div className="action-section">
                  <h4>选择查验的玩家</h4>
                  <div className="target-buttons">
                    {players.filter(p => p.isAlive && p.id !== currentPlayer.id).map(player => (
                      <button 
                        key={player.id} 
                        onClick={() => handleNightAction('seer_check', player.id)}
                        disabled={nightActionComplete}
                      >
                        {player.name}
                      </button>
                    ))}
                  </div>
                  {seerResult && (
                    <div className="seer-result">
                      <h5>查验结果</h5>
                      <p>{seerResult.playerName} 是 <strong>{seerResult.isWerewolf ? '狼人' : '好人'}</strong></p>
                    </div>
                  )}
                </div>
              )}
              
              {/* 女巫行动界面 */}
              {currentNightRole === 'WITCH' && currentPlayer?.role === 'WITCH' && (
                <div className="action-section">
                  <h4>女巫行动</h4>
                  <div className="witch-actions">
                    <div>
                      <h5>使用解药救人 {witchUsedSave ? '(已使用)' : ''}</h5>
                      <div className="target-buttons">
                        {!witchUsedSave && players.filter(p => p.isAlive).map(player => (
                          <button 
                            key={player.id} 
                            onClick={() => handleNightAction('witch_save', player.id)}
                            disabled={nightActionComplete}
                          >
                            {player.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5>使用毒药毒人 {witchUsedPoison ? '(已使用)' : ''}</h5>
                      <div className="target-buttons">
                        {!witchUsedPoison && players.filter(p => p.isAlive && p.id !== currentPlayer.id).map(player => (
                          <button 
                            key={player.id} 
                            onClick={() => handleNightAction('witch_poison', player.id)}
                            disabled={nightActionComplete}
                          >
                            {player.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="witch-skip">
                      <button 
                        className="skip-btn" 
                        onClick={() => executeNightAction('WITCH', { save: null, poison: null }, currentPlayer)}
                        disabled={nightActionComplete}
                      >
                        跳过行动
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 等待其他玩家行动 */}
              {currentNightRole && (!currentPlayer || currentPlayer.role !== currentNightRole) && (
                <div className="waiting-phase">
                  <p>等待{getRoleName(currentNightRole)}完成行动...</p>
                </div>
              )}
            </div>
          )}

          {gamePhase === GAME_PHASES.DAY && (
            <div className="day-phase">
              <h3>白天讨论</h3>
              {aiThinking && currentSpeaker && (
                <div className="ai-thinking">
                  <span>🤔 {players.find(p => p.id === currentSpeaker)?.name} 正在思考...</span>
                </div>
              )}
              <div className="discussion-area">
                {dayDiscussion.map((discussion, index) => (
                  <div key={index} className="discussion-item">
                    <div className="speaker-info">
                      <span className="speaker-name">{discussion.playerName}</span>
                      <span className="speak-time">{discussion.timestamp}</span>
                    </div>
                    <div className="speech-content">{discussion.speech}</div>
                  </div>
                ))}
              </div>
              
              {waitingForUserSpeech && (
                <div className="user-speech-input">
                  <h4>请输入您的发言</h4>
                  <textarea
                    value={userSpeech}
                    onChange={(e) => setUserSpeech(e.target.value)}
                    placeholder="请输入您的发言内容..."
                    rows={3}
                    className="speech-textarea"
                  />
                  <button 
                    onClick={submitUserSpeech}
                    disabled={!userSpeech.trim()}
                    className="submit-speech-btn"
                  >
                    提交发言
                  </button>
                </div>
              )}
              
              {!waitingForUserSpeech && currentSpeaker === null && (
                <button 
                  className="phase-btn" 
                  onClick={() => {
                    setGamePhase(GAME_PHASES.VOTING)
                    processAIVoting()
                  }}
                >
                  开始投票
                </button>
              )}
            </div>
          )}

          {gamePhase === GAME_PHASES.VOTING && (
            <div className="voting-phase">
              <h3>投票阶段</h3>
              {isProcessingAI && (
                <div className="ai-voting">
                  <span>🗳️ AI玩家正在投票...</span>
                </div>
              )}
              <p>请选择你要投票的玩家</p>
              <div className="voting-buttons">
                {players.filter(p => p.isAlive).map(player => (
                  <button 
                    key={player.id} 
                    onClick={() => handleVote(currentPlayer.id, player.id)}
                    className={votes[currentPlayer.id] === player.id ? 'selected' : ''}
                    disabled={isProcessingAI}
                  >
                    {player.name}
                  </button>
                ))}
              </div>
              <div className="vote-status">
                <h4>投票状态</h4>
                {Object.entries(votes).map(([voterId, targetId]) => {
                  const voter = players.find(p => p.id === parseInt(voterId))
                  const target = players.find(p => p.id === targetId)
                  return (
                    <div key={voterId} className="vote-item">
                      {voter?.name} → {target?.name}
                    </div>
                  )
                })}
              </div>
              <button 
                className="phase-btn" 
                onClick={processVoting}
                disabled={!votes[currentPlayer.id] || isProcessingAI}
              >
                确认投票
              </button>
            </div>
          )}
          
          {hunterCanShoot && (
            <div className="hunter-shoot">
              <h3>🏹 猎人开枪</h3>
              <p>猎人被投票出局，可以开枪带走一名玩家</p>
              <div className="hunter-targets">
                {players.filter(p => p.isAlive).map(player => (
                  <button 
                    key={player.id} 
                    onClick={() => handleHunterShoot(player.id)}
                    className="hunter-target-btn"
                  >
                    {player.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gamePhase === GAME_PHASES.GAME_OVER && (
            <div className="game-over">
              <h2>游戏结束</h2>
              <div className="winner">
                {winner === 'villagers' ? '🎉 好人阵营胜利！' : '🐺 狼人阵营胜利！'}
              </div>
              <button className="restart-btn" onClick={resetGameState}>
                重新开始
              </button>
            </div>
          )}

          <div className="game-log">
            <h3>游戏日志</h3>
            <div className="log-content">
              {gameLog.map((log, index) => (
                <div key={index} className="log-entry">
                  <span className="log-time">{log.timestamp}</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
