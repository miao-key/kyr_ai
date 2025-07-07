import { useState, useCallback } from 'react'
import { GAME_PHASES, PLAYER_NAMES } from '../constants/gameConstants'
import { initializePlayers, checkGameEnd } from '../utils/gameUtils'

export const useGameState = () => {
  const [gamePhase, setGamePhase] = useState(GAME_PHASES.LOBBY)
  const [players, setPlayers] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [gameLog, setGameLog] = useState([])
  const [dayNumber, setDayNumber] = useState(1)
  const [winner, setWinner] = useState(null)
  const [customRoles, setCustomRoles] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)

  // 添加游戏日志
  const addToLog = useCallback((message) => {
    setGameLog(prev => [...prev, { 
      message, 
      timestamp: new Date().toLocaleTimeString() 
    }])
  }, [])

  // 初始化游戏
  const initializeGame = useCallback(() => {
    const newPlayers = initializePlayers(customRoles, selectedRole, PLAYER_NAMES)
    
    setPlayers(newPlayers)
    setCurrentPlayer(newPlayers.find(p => p.name === '你'))
    setGamePhase(GAME_PHASES.NIGHT)
    setGameLog([])
    setDayNumber(1)
    setWinner(null)
    addToLog('游戏开始！第1夜降临...')
    
    return newPlayers
  }, [customRoles, selectedRole, addToLog])

  // 检查游戏结束
  const handleGameEnd = useCallback((playerList = players) => {
    const result = checkGameEnd(playerList)
    if (result) {
      setWinner(result.winner)
      setGamePhase(GAME_PHASES.GAME_OVER)
      addToLog(result.message)
      return true
    }
    return false
  }, [players, addToLog])

  // 进入下一天
  const nextDay = useCallback(() => {
    setDayNumber(prev => prev + 1)
    setGamePhase(GAME_PHASES.NIGHT)
    addToLog(`第${dayNumber + 1}夜降临...`)
  }, [dayNumber, addToLog])

  return {
    // 状态
    gamePhase,
    players,
    currentPlayer,
    gameLog,
    dayNumber,
    winner,
    customRoles,
    selectedRole,
    
    // 状态更新函数
    setGamePhase,
    setPlayers,
    setCurrentPlayer,
    setCustomRoles,
    setSelectedRole,
    
    // 业务逻辑函数
    addToLog,
    initializeGame,
    handleGameEnd,
    nextDay
  }
}