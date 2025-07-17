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
  
  // 初始化游戏
  const initializeGame = useCallback((humanPlayerRole = null) => {
    // 生成8个AI玩家和1个人类玩家
    const { allPlayers, humanPlayerData } = generateAIPlayers(humanPlayerName, humanPlayerRole);
    
    setPlayers(allPlayers);
    setHumanPlayer(humanPlayerData);
    setDay(1); // 第一天
    setGamePhase(GAME_PHASES.NIGHT); // 从夜晚开始
    setGameLogs([{ day: 1, message: '游戏开始，天黑请闭眼' }]);
    setGameResult(null);
    setKilledAtNight(null);
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
  }, [gamePhase, day, addGameLog, checkGameOver]);
  
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
  
  // 狼人杀人
  const wolfKill = useCallback((targetId) => {
    setKilledAtNight(targetId);
    addGameLog(`狼人选择了${players.find(p => p.id === targetId)?.name || '未知玩家'}`);
  }, [players, addGameLog]);
  
  // 女巫救人/毒人
  const witchAction = useCallback((actionType, targetId) => {
    if (actionType === 'save') {
      setKilledAtNight(null);
      addGameLog('女巫使用了解药');
    } else if (actionType === 'poison') {
      updatePlayerStatus(targetId, PLAYER_STATUS.DEAD);
      addGameLog(`女巫使用了毒药，${players.find(p => p.id === targetId)?.name || '未知玩家'}中毒身亡`);
    }
  }, [players, updatePlayerStatus, addGameLog]);
  
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
    
    Object.entries(voteCount).forEach(([playerId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedPlayerId = playerId;
      }
    });
    
    if (eliminatedPlayerId) {
      updatePlayerStatus(eliminatedPlayerId, PLAYER_STATUS.DEAD);
      const eliminatedPlayer = players.find(p => p.id === eliminatedPlayerId);
      addGameLog(`${eliminatedPlayer?.name || '未知玩家'}被投票出局`);
    }
    
    return eliminatedPlayerId;
  }, [players, updatePlayerStatus, addGameLog]);
  
  return {
    gamePhase,
    day,
    players,
    humanPlayer,
    gameLogs,
    gameResult,
    killedAtNight,
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