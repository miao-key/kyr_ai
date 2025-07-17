import { useState, useEffect, useCallback } from 'react';
import { 
  GAME_PHASES, 
  ROLE_TYPES, 
  PLAYER_STATUS, 
  GAME_CONFIG,
  GAME_RESULTS
} from '../constants/gameConstants';
import { generateAIPlayers } from '../utils/gameUtils';

const useGameState = (humanPlayerName = '玩家') => {
  // 游戏阶段状态
  const [gamePhase, setGamePhase] = useState(GAME_PHASES.LOBBY);
  
  // 游戏天数
  const [day, setDay] = useState(0);
  
  // 所有玩家（包括AI和人类玩家）
  const [players, setPlayers] = useState([]);
  
  // 当前玩家（人类玩家）
  const [humanPlayer, setHumanPlayer] = useState(null);
  
  // 游戏日志
  const [gameLogs, setGameLogs] = useState([]);
  
  // 游戏结果
  const [gameResult, setGameResult] = useState(null);
  
  // 夜晚被杀玩家
  const [killedAtNight, setKilledAtNight] = useState(null);
  
  // 女巫技能使用状态
  const [witchPowers, setWitchPowers] = useState({
    usedSave: false,
    usedPoison: false
  });
  
  // 初始化游戏
  const initializeGame = useCallback((playerName = '玩家', humanPlayerRole = null) => {
    // 生成8个AI玩家和1个人类玩家
    const { allPlayers, humanPlayerData } = generateAIPlayers(playerName || humanPlayerName, humanPlayerRole);
    
    setPlayers(allPlayers);
    setHumanPlayer(humanPlayerData);
    setDay(1); // 第一天
    setGamePhase(GAME_PHASES.NIGHT); // 从夜晚开始
    setGameLogs([{ day: 1, message: '游戏开始，天黑请闭眼' }]);
    setGameResult(null);
    setKilledAtNight(null);
    setWitchPowers({
      usedSave: false,
      usedPoison: false
    });
  }, [humanPlayerName]);
  
  // 添加游戏日志
  const addGameLog = useCallback((message) => {
    setGameLogs(prev => [...prev, { day, message }]);
  }, [day]);
  
  // 检查游戏是否结束
  const checkGameOver = useCallback(() => {
    // 统计存活玩家
    const aliveWolves = players.filter(p => p.role === ROLE_TYPES.WEREWOLF && p.status === PLAYER_STATUS.ALIVE).length;
    const aliveVillagers = players.filter(p => p.role !== ROLE_TYPES.WEREWOLF && p.status === PLAYER_STATUS.ALIVE).length;
    
    // 狼人全部死亡，好人获胜
    if (aliveWolves === 0) {
      setGameResult(GAME_RESULTS.VILLAGER_WIN);
      setGamePhase(GAME_PHASES.GAME_OVER);
      addGameLog('游戏结束，村民阵营获胜！');
      return true;
    }
    
    // 狼人数量大于等于好人，狼人获胜
    if (aliveWolves >= aliveVillagers) {
      setGameResult(GAME_RESULTS.WEREWOLF_WIN);
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
  }, [humanPlayer]);
  
  // 处理夜晚结束
  const handleNightEnd = useCallback(() => {
    // 如果有被杀的玩家且没有被女巫救，则更新状态
    if (killedAtNight) {
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
          // 猎人技能处理逻辑可以在这里添加
        }
      }
    }
    
    // 清空夜晚被杀信息，准备下一个阶段
    setKilledAtNight(null);
  }, [killedAtNight, players, addGameLog, updatePlayerStatus]);
  
  // 进入下一阶段
  const nextPhase = useCallback(() => {
    // 检查游戏是否结束
    if (checkGameOver()) return;
    
    switch (gamePhase) {
      case GAME_PHASES.LOBBY:
        setGamePhase(GAME_PHASES.NIGHT);
        addGameLog('天黑请闭眼');
        break;
        
      case GAME_PHASES.NIGHT:
        // 夜晚结束，处理夜晚死亡
        handleNightEnd();
        
        // 检查游戏是否结束
        if (checkGameOver()) return;
        
        setGamePhase(GAME_PHASES.DAY_DISCUSSION);
        addGameLog('天亮了，进入讨论阶段');
        break;
        
      case GAME_PHASES.DAY_DISCUSSION:
        setGamePhase(GAME_PHASES.DAY_VOTE);
        addGameLog('讨论结束，进入投票阶段');
        break;
        
      case GAME_PHASES.DAY_VOTE:
        // 投票结束，进入新的一天
        setDay(prev => prev + 1);
        setGamePhase(GAME_PHASES.NIGHT);
        addGameLog(`第${day}天结束，天黑请闭眼`);
        break;
        
      default:
        break;
    }
  }, [gamePhase, day, addGameLog, checkGameOver, handleNightEnd]);
  
  // 狼人杀人
  const wolfKill = useCallback((targetId) => {
    setKilledAtNight(targetId);
    const targetPlayer = players.find(p => p.id === targetId);
    addGameLog(`狼人选择了${targetPlayer?.name || '未知玩家'}`);
  }, [players, addGameLog]);
  
  // 女巫救人/毒人
  const witchAction = useCallback((actionType, targetId) => {
    if (actionType === 'save') {
      if (witchPowers.usedSave) {
        addGameLog('女巫的解药已经用过了');
        return;
      }
      
      setKilledAtNight(null); // 清除被杀的玩家
      setWitchPowers(prev => ({ ...prev, usedSave: true }));
      addGameLog('女巫使用了解药');
    } else if (actionType === 'poison') {
      if (witchPowers.usedPoison) {
        addGameLog('女巫的毒药已经用过了');
        return;
      }
      
      updatePlayerStatus(targetId, PLAYER_STATUS.DEAD);
      setWitchPowers(prev => ({ ...prev, usedPoison: true }));
      const targetPlayer = players.find(p => p.id === targetId);
      addGameLog(`女巫使用了毒药，${targetPlayer?.name || '未知玩家'}中毒身亡`);
    }
  }, [players, updatePlayerStatus, addGameLog, witchPowers]);
  
  // 预言家查验
  const seerCheck = useCallback((targetId) => {
    const targetPlayer = players.find(p => p.id === targetId);
    const isWolf = targetPlayer?.role === ROLE_TYPES.WEREWOLF;
    addGameLog(`预言家查验了${targetPlayer?.name || '未知玩家'}`);
    return isWolf;
  }, [players, addGameLog]);
  
  // 白天投票
  const dayVote = useCallback((votes) => {
    // 计票
    const voteCount = {};
    votes.forEach(vote => {
      if (!voteCount[vote.targetId]) {
        voteCount[vote.targetId] = 0;
      }
      voteCount[vote.targetId]++;
    });
    
    // 找到票数最多的玩家
    let maxVotes = 0;
    let eliminatedPlayerId = null;
    let isTie = false;
    
    Object.entries(voteCount).forEach(([playerId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedPlayerId = playerId;
        isTie = false;
      } else if (count === maxVotes) {
        isTie = true; // 平票情况
      }
    });
    
    if (isTie) {
      addGameLog('投票结果为平票，无人出局');
      return null;
    }
    
    if (eliminatedPlayerId) {
      updatePlayerStatus(eliminatedPlayerId, PLAYER_STATUS.DEAD);
      const eliminatedPlayer = players.find(p => p.id === eliminatedPlayerId);
      addGameLog(`${eliminatedPlayer?.name || '未知玩家'}被投票出局`);
      
      // 检查是否为猎人，如果是则可以开枪
      if (eliminatedPlayer && eliminatedPlayer.role === ROLE_TYPES.HUNTER) {
        addGameLog('猎人可以选择带走一名玩家');
        // 猎人技能处理逻辑可以在这里添加
      }
    }
    
    return eliminatedPlayerId;
  }, [players, updatePlayerStatus, addGameLog]);
  
  // 使用useEffect来自动检查游戏是否结束
  useEffect(() => {
    if (gamePhase !== GAME_PHASES.LOBBY && gamePhase !== GAME_PHASES.GAME_OVER) {
      checkGameOver();
    }
  }, [players, checkGameOver, gamePhase]);
  
  return {
    gamePhase,
    day,
    players,
    humanPlayer,
    gameLogs,
    gameResult,
    killedAtNight,
    witchPowers,
    initializeGame,
    nextPhase,
    updatePlayerStatus,
    wolfKill,
    witchAction,
    seerCheck,
    dayVote,
    addGameLog,
  };
};

export default useGameState; 