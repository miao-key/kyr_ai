import { useState, useEffect, useCallback } from 'react';
import { 
  GAME_PHASES, 
  ROLE_TYPES, 
  PLAYER_STATUS, 
  GAME_CONFIG,
  GAME_RESULTS,
  NIGHT_ACTION_ORDER
} from '../constants/gameConstants';
import { generateAIPlayers } from '../utils/gameUtils';

const useGameState = () => {
  // 游戏阶段状态
  const [gamePhase, setGamePhase] = useState(GAME_PHASES.LOBBY);
  
  // 游戏天数
  const [day, setDay] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  
  // 所有玩家（包括AI和人类玩家）
  const [players, setPlayers] = useState([]);
  
  // 当前玩家（人类玩家）
  const [humanPlayer, setHumanPlayer] = useState(null);
  
  // 游戏日志
  const [logs, setLogs] = useState([]);
  
  // 游戏结果
  const [gameWinner, setGameWinner] = useState(null);
  
  // 夜晚被杀玩家
  const [killedAtNight, setKilledAtNight] = useState(null);
  const [nightVictim, setNightVictim] = useState(null);
  
  // 女巫技能使用状态
  const [witchPowers, setWitchPowers] = useState({
    usedSave: false,
    usedPoison: false
  });
  
  // 投票相关状态
  const [votedPlayer, setVotedPlayer] = useState(null);
  const [hasHumanVoted, setHasHumanVoted] = useState(false);
  const [eliminatedPlayer, setEliminatedPlayer] = useState(null);
  
  // 当前行动角色
  const [currentRole, setCurrentRole] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  
  // 预言家和女巫行动状态
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [canSave, setCanSave] = useState(true);
  const [canPoison, setCanPoison] = useState(true);
  const [poisonTarget, setPoisonTarget] = useState(null);
  
  // 讨论阶段状态
  const [currentMessage, setCurrentMessage] = useState('');
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [discussionTimeRemaining, setDiscussionTimeRemaining] = useState(60);
  const [timeRemaining, setTimeRemaining] = useState(30);
  
  // 活跃玩家列表
  const [activePlayers, setActivePlayers] = useState([]);
  
  // 游戏是否已开始
  const [isGameStarted, setIsGameStarted] = useState(false);
  
  // 玩家信息
  const [playerName, setPlayerName] = useState('玩家');
  const [selectedHumanRole, setSelectedHumanRole] = useState('random');
  
  // 夜晚行动顺序
  const [nightActionIndex, setNightActionIndex] = useState(0);
  
  // 添加游戏日志
  const addGameLog = useCallback((message) => {
    setLogs(prev => [...prev, { day, message }]);
  }, [day]);
  
  // 检查游戏是否结束
  const checkGameOver = useCallback(() => {
    // 统计存活玩家
    const aliveWolves = players.filter(p => p.role === ROLE_TYPES.WEREWOLF && p.status === PLAYER_STATUS.ALIVE).length;
    const aliveVillagers = players.filter(p => p.role !== ROLE_TYPES.WEREWOLF && p.status === PLAYER_STATUS.ALIVE).length;
    
    // 狼人全部死亡，好人获胜
    if (aliveWolves === 0) {
      setGameWinner('villagers');
      setGamePhase(GAME_PHASES.GAME_OVER);
      addGameLog('游戏结束，村民阵营获胜！');
      return true;
    }
    
    // 狼人数量大于等于好人，狼人获胜
    if (aliveWolves >= aliveVillagers) {
      setGameWinner('werewolves');
      setGamePhase(GAME_PHASES.GAME_OVER);
      addGameLog('游戏结束，狼人阵营获胜！');
      return true;
    }
    
    return false;
  }, [players, addGameLog]);
  
  // 更新玩家状态
  const updatePlayerStatus = useCallback((playerId, newStatus) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(p => 
        p.id === playerId ? { ...p, status: newStatus } : p
      )
    );
    
    // 如果是人类玩家
    if (humanPlayer && humanPlayer.id === playerId) {
      setHumanPlayer(prev => ({ ...prev, status: newStatus }));
    }
    
    // 更新活跃玩家列表
    if (newStatus === PLAYER_STATUS.DEAD) {
      setActivePlayers(prev => prev.filter(p => p.id !== playerId));
    }
  }, [humanPlayer]);
  
  // 处理夜晚结束
  const handleNightEnd = useCallback(() => {
    // 如果有被杀的玩家且没有被女巫救，则更新状态
    if (killedAtNight && !isSaved) {
      const killedPlayer = players.find(p => p.id === killedAtNight);
      if (killedPlayer) {
        // 检查是否有特殊角色死亡逻辑（如猎人）
        const isHunter = killedPlayer.role === ROLE_TYPES.HUNTER;
        
        // 更新玩家状态为死亡
        updatePlayerStatus(killedAtNight, PLAYER_STATUS.DEAD);
        
        addGameLog(`${killedPlayer.name} 在夜晚死亡${isHunter ? '（猎人）' : ''}`);
        
        // 如果是猎人，应该有开枪的机会（这部分逻辑可以扩展）
        if (isHunter) {
          addGameLog('猎人可以选择带走一名玩家');
        }
      }
    }
    
    // 清空夜晚被杀信息，准备下一个阶段
    setKilledAtNight(null);
    setNightVictim(null);
    setIsSaved(false);
    
    // 进入白天阶段
    setGamePhase(GAME_PHASES.DAY_DISCUSSION);
    addGameLog('天亮了，进入讨论阶段');
    
    // 检查游戏是否结束
    checkGameOver();
  }, [killedAtNight, isSaved, players, addGameLog, updatePlayerStatus, checkGameOver]);
  
  // 处理预言家查验
  const handleSeerCheck = useCallback((targetId) => {
    const targetPlayer = players.find(p => p.id === targetId);
    const isWolf = targetPlayer?.role === ROLE_TYPES.WEREWOLF;
    addGameLog(`预言家查验了${targetPlayer?.name || '未知玩家'}`);
    handleNextNightRole();
    return isWolf;
  }, [players, addGameLog]);
  
  // 处理女巫救人
  const handleWitchSave = useCallback(() => {
    if (canSave) {
      setIsSaved(true);
      setCanSave(false);
      addGameLog('女巫使用了解药');
    }
    handleNextNightRole();
  }, [canSave, addGameLog]);
  
  // 处理女巫毒人
  const handleWitchPoison = useCallback((targetId) => {
    if (canPoison) {
      const targetPlayer = players.find(p => p.id === targetId);
      updatePlayerStatus(targetId, PLAYER_STATUS.DEAD);
      setCanPoison(false);
      addGameLog(`女巫使用了毒药，${targetPlayer?.name || '未知玩家'}中毒身亡`);
    }
    handleNextNightRole();
  }, [canPoison, players, updatePlayerStatus, addGameLog]);
  
  // 跳过女巫行动
  const skipWitchAction = useCallback(() => {
    addGameLog('女巫选择不使用药水');
    handleNextNightRole();
  }, [addGameLog]);
  
  // 处理狼人杀人
  const handleWolfKill = useCallback((targetId) => {
    setKilledAtNight(targetId);
    setNightVictim(targetId);
    const targetPlayer = players.find(p => p.id === targetId);
    addGameLog(`狼人选择了${targetPlayer?.name || '未知玩家'}`);
    handleNextNightRole();
  }, [players, addGameLog]);
  
  // 处理下一个夜晚角色
  const handleNextNightRole = useCallback(() => {
    const nextIndex = nightActionIndex + 1;
    
    if (nextIndex < NIGHT_ACTION_ORDER.length) {
      setNightActionIndex(nextIndex);
      setTargetPlayer(null); // 重置目标玩家
    } else {
      // 所有角色行动完毕，夜晚结束
      handleNightEnd();
      setNightActionIndex(0); // 重置夜晚行动索引
    }
  }, [nightActionIndex, handleNightEnd]);
  
  // 初始化夜晚角色
  const initializeNightRole = useCallback(() => {
    if (gamePhase !== GAME_PHASES.NIGHT) return;
    
    const currentNightRole = NIGHT_ACTION_ORDER[nightActionIndex];
    setCurrentRole(currentNightRole);
    
    // 检查当前角色是否还有存活的玩家
    const roleExists = players.some(p => p.role === currentNightRole && p.status === PLAYER_STATUS.ALIVE);
    
    if (!roleExists) {
      // 如果没有当前角色的存活玩家，直接进入下一个角色
      handleNextNightRole();
      return;
    }
    
    // 如果是人类玩家的角色，设置currentTurn为人类玩家ID
    if (humanPlayer && humanPlayer.role === currentNightRole && humanPlayer.status === PLAYER_STATUS.ALIVE) {
      setCurrentTurn(humanPlayer.id);
      addGameLog(`${currentNightRole === ROLE_TYPES.WEREWOLF ? '狼人' : currentNightRole === ROLE_TYPES.SEER ? '预言家' : '女巫'}请睁眼`);
    } else {
      // 否则找到第一个符合条件的AI玩家
      const aiPlayer = players.find(p => p.role === currentNightRole && p.status === PLAYER_STATUS.ALIVE);
      if (aiPlayer) {
        setCurrentTurn(aiPlayer.id);
        addGameLog(`${currentNightRole === ROLE_TYPES.WEREWOLF ? '狼人' : currentNightRole === ROLE_TYPES.SEER ? '预言家' : '女巫'}请睁眼`);
        
        // AI玩家在短暂延迟后自动执行操作
        if (currentNightRole === ROLE_TYPES.WEREWOLF) {
          // AI狼人自动选择一个非狼人玩家击杀
          const targets = players.filter(p => p.role !== ROLE_TYPES.WEREWOLF && p.status === PLAYER_STATUS.ALIVE);
          if (targets.length > 0) {
            const randomTarget = targets[Math.floor(Math.random() * targets.length)];
            setTimeout(() => {
              handleWolfKill(randomTarget.id);
            }, 2000);
          } else {
            // 没有可击杀目标，跳过
            setTimeout(() => {
              handleNextNightRole();
            }, 1000);
          }
        } else if (currentNightRole === ROLE_TYPES.SEER) {
          // AI预言家自动查验一个玩家
          const targets = players.filter(p => p.role !== ROLE_TYPES.SEER && p.status === PLAYER_STATUS.ALIVE);
          if (targets.length > 0) {
            const randomTarget = targets[Math.floor(Math.random() * targets.length)];
            setTimeout(() => {
              handleSeerCheck(randomTarget.id);
            }, 2000);
          } else {
            // 没有可查验目标，跳过
            setTimeout(() => {
              handleNextNightRole();
            }, 1000);
          }
        } else if (currentNightRole === ROLE_TYPES.WITCH) {
          // AI女巫的逻辑
          setTimeout(() => {
            if (nightVictim && canSave) {
              // 有人被杀且有解药，50%概率救人
              if (Math.random() > 0.5) {
                handleWitchSave();
              } else {
                // 不使用解药
                skipWitchAction();
              }
            } else if (canPoison) {
              // 有毒药，30%概率使用
              if (Math.random() < 0.3) {
                const targets = players.filter(p => p.role !== ROLE_TYPES.WITCH && p.status === PLAYER_STATUS.ALIVE);
                if (targets.length > 0) {
                  const randomTarget = targets[Math.floor(Math.random() * targets.length)];
                  handleWitchPoison(randomTarget.id);
                } else {
                  skipWitchAction();
                }
              } else {
                skipWitchAction();
              }
            } else {
              // 没有药可用，跳过
              skipWitchAction();
            }
          }, 2000);
        }
      } else {
        // 如果没有符合条件的玩家，进入下一个角色
        handleNextNightRole();
      }
    }
  }, [nightActionIndex, humanPlayer, players, addGameLog, handleNextNightRole, gamePhase, nightVictim, canSave, canPoison, handleWitchSave, skipWitchAction, handleWitchPoison, handleSeerCheck, handleWolfKill]);
  
  // 初始化游戏
  const initializeGame = useCallback((playerName = '玩家', humanPlayerRole = null) => {
    // 生成8个AI玩家和1个人类玩家
    const { allPlayers, humanPlayerData } = generateAIPlayers(playerName, humanPlayerRole);
    
    setPlayers(allPlayers);
    setHumanPlayer(humanPlayerData);
    setDay(1);
    setCurrentDay(1);
    setGamePhase(GAME_PHASES.NIGHT); // 从夜晚开始
    setLogs([{ day: 1, message: '游戏开始，天黑请闭眼' }]);
    setGameWinner(null);
    setKilledAtNight(null);
    setNightVictim(null);
    setWitchPowers({
      usedSave: false,
      usedPoison: false
    });
    setActivePlayers(allPlayers);
    setIsGameStarted(true);
    setNightActionIndex(0); // 重置夜晚行动索引
    
    // 初始化第一个夜晚角色
    setTimeout(() => {
      initializeNightRole();
    }, 1000);
  }, [initializeNightRole]);
  
  // 开始游戏
  const startGame = useCallback((name, role) => {
    setPlayerName(name);
    setSelectedHumanRole(role);
    initializeGame(name, role);
  }, [initializeGame]);
  
  // 重新开始游戏
  const restartGame = useCallback(() => {
    setGamePhase(GAME_PHASES.LOBBY);
    setDay(0);
    setCurrentDay(1);
    setPlayers([]);
    setHumanPlayer(null);
    setLogs([]);
    setGameWinner(null);
    setKilledAtNight(null);
    setNightVictim(null);
    setWitchPowers({
      usedSave: false,
      usedPoison: false
    });
    setVotedPlayer(null);
    setHasHumanVoted(false);
    setEliminatedPlayer(null);
    setCurrentRole(null);
    setCurrentTurn(null);
    setTargetPlayer(null);
    setIsSaved(false);
    setCanSave(true);
    setCanPoison(true);
    setPoisonTarget(null);
    setCurrentMessage('');
    setIsCountdownActive(false);
    setDiscussionTimeRemaining(60);
    setTimeRemaining(30);
    setActivePlayers([]);
    setIsGameStarted(false);
    setNightActionIndex(0);
  }, []);
  
  // 处理白天讨论
  const handleDayDiscussion = useCallback(() => {
    setGamePhase(GAME_PHASES.VOTING);
    addGameLog('讨论结束，进入投票阶段');
  }, [addGameLog]);
  
  // 处理投票
  const handleVoting = useCallback(() => {
    if (votedPlayer) {
      const targetPlayer = players.find(p => p.id === votedPlayer);
      addGameLog(`${humanPlayer?.name || '玩家'} 投票给了 ${targetPlayer?.name || '未知玩家'}`);
      setHasHumanVoted(true);
      
      // 处理投票结果
      updatePlayerStatus(votedPlayer, PLAYER_STATUS.DEAD);
      setEliminatedPlayer(votedPlayer);
      addGameLog(`${targetPlayer?.name || '未知玩家'}被投票出局`);
      
      // 检查是否为猎人，如果是则可以开枪
      if (targetPlayer && targetPlayer.role === ROLE_TYPES.HUNTER) {
        addGameLog('猎人可以选择带走一名玩家');
      }
      
      // 检查游戏是否结束
      if (!checkGameOver()) {
        // 进入下一天
        setDay(prev => prev + 1);
        setCurrentDay(prev => prev + 1);
        setGamePhase(GAME_PHASES.NIGHT);
        addGameLog(`第${day}天结束，天黑请闭眼`);
        
        // 重置夜晚行动索引并初始化第一个夜晚角色
        setNightActionIndex(0);
        setTimeout(() => {
          initializeNightRole();
        }, 1000);
      }
    }
  }, [votedPlayer, players, humanPlayer, addGameLog, updatePlayerStatus, checkGameOver, day, initializeNightRole]);
  
  // 完成投票
  const finishVoting = useCallback(() => {
    handleVoting();
  }, [handleVoting]);
  
  // 进入下一阶段
  const handleNextPhase = useCallback(() => {
    // 进入下一天
    setDay(prev => prev + 1);
    setCurrentDay(prev => prev + 1);
    setGamePhase(GAME_PHASES.NIGHT);
    addGameLog(`第${day}天结束，天黑请闭眼`);
    
    // 重置投票相关状态
    setVotedPlayer(null);
    setHasHumanVoted(false);
    setEliminatedPlayer(null);
    
    // 重置夜晚行动索引并初始化第一个夜晚角色
    setNightActionIndex(0);
    setTimeout(() => {
      initializeNightRole();
    }, 1000);
  }, [day, addGameLog, initializeNightRole]);
  
  // 发送消息
  const sendMessage = useCallback(() => {
    if (currentMessage.trim()) {
      addGameLog(`${humanPlayer?.name || '玩家'} 说: ${currentMessage}`);
      setCurrentMessage('');
    }
  }, [currentMessage, humanPlayer, addGameLog]);
  
  // 使用useEffect来自动检查游戏是否结束
  useEffect(() => {
    if (gamePhase !== GAME_PHASES.LOBBY && gamePhase !== GAME_PHASES.GAME_OVER) {
      checkGameOver();
    }
    
    // 更新活跃玩家列表
    setActivePlayers(players.filter(p => p.status === PLAYER_STATUS.ALIVE));
  }, [players, checkGameOver, gamePhase]);
  
  // 使用useEffect监听夜晚角色变化
  useEffect(() => {
    if (gamePhase === GAME_PHASES.NIGHT && currentRole === null) {
      initializeNightRole();
    }
  }, [gamePhase, currentRole, initializeNightRole]);
  
  // 使用useEffect监听nightActionIndex变化
  useEffect(() => {
    if (gamePhase === GAME_PHASES.NIGHT && nightActionIndex >= 0 && nightActionIndex < NIGHT_ACTION_ORDER.length) {
      initializeNightRole();
    }
  }, [nightActionIndex, gamePhase, initializeNightRole]);
  
  return {
    gamePhase,
    currentDay,
    players,
    logs,
    gameWinner,
    nightVictim,
    votedPlayer,
    setVotedPlayer,
    hasHumanVoted,
    eliminatedPlayer,
    currentRole,
    currentTurn,
    targetPlayer,
    setTargetPlayer,
    isSaved,
    canSave,
    canPoison,
    poisonTarget,
    setPoisonTarget,
    currentMessage,
    setCurrentMessage,
    isCountdownActive,
    discussionTimeRemaining,
    timeRemaining,
    activePlayers,
    playerName,
    setPlayerName,
    selectedHumanRole,
    setSelectedHumanRole,
    startGame,
    restartGame,
    handleNightEnd,
    handleSeerCheck,
    handleWitchSave,
    handleWitchPoison,
    skipWitchAction,
    handleWolfKill,
    handleDayDiscussion,
    finishVoting,
    handleNextPhase,
    sendMessage,
  };
};

export default useGameState; 