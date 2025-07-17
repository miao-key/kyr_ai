import { useCallback } from 'react';
import { 
  ROLE_TYPES, 
  PLAYER_STATUS, 
  GAME_PHASES,
  WITCH_POWERS
} from '../constants/gameConstants';

// AI玩家决策逻辑
const useAI = (players, gamePhase, day, killedAtNight) => {
  
  // 获取存活的玩家列表
  const getAlivePlayers = useCallback(() => {
    return players.filter(player => player.status === PLAYER_STATUS.ALIVE);
  }, [players]);
  
  // 获取特定角色的AI玩家
  const getRolePlayers = useCallback((role) => {
    return players.filter(
      player => player.role === role && 
      player.status === PLAYER_STATUS.ALIVE && 
      !player.isHuman
    );
  }, [players]);
  
  // 狼人AI决策 - 选择要杀的人
  const getWolfDecision = useCallback(() => {
    if (gamePhase !== GAME_PHASES.NIGHT) return null;
    
    const aliveWerewolves = getRolePlayers(ROLE_TYPES.WEREWOLF);
    if (aliveWerewolves.length === 0) return null;
    
    // 获取所有可以被杀的玩家（活着的非狼人）
    const targets = getAlivePlayers().filter(
      player => player.role !== ROLE_TYPES.WEREWOLF
    );
    
    if (targets.length === 0) return null;
    
    // 简单AI逻辑：优先选择有特殊身份的玩家（预言家、女巫、猎人）
    const specialRoles = targets.filter(
      player => player.role !== ROLE_TYPES.VILLAGER
    );
    
    if (specialRoles.length > 0) {
      // 随机选择一个特殊身份玩家
      const randomIndex = Math.floor(Math.random() * specialRoles.length);
      return specialRoles[randomIndex].id;
    }
    
    // 如果没有特殊身份玩家，随机选择一个普通村民
    const randomIndex = Math.floor(Math.random() * targets.length);
    return targets[randomIndex].id;
  }, [gamePhase, getAlivePlayers, getRolePlayers]);
  
  // 预言家AI决策 - 选择要查验的人
  const getSeerDecision = useCallback(() => {
    if (gamePhase !== GAME_PHASES.NIGHT) return null;
    
    const aliveSeer = getRolePlayers(ROLE_TYPES.SEER);
    if (aliveSeer.length === 0) return null;
    
    // 获取所有未查验过的存活玩家
    const targets = getAlivePlayers().filter(player => {
      // 这里可以添加一个标记系统，记录已经查验过的玩家
      // 简化版本：每次随机选择一个未查验的玩家
      return player.id !== aliveSeer[0].id;
    });
    
    if (targets.length === 0) return null;
    
    // 随机选择一个玩家查验
    const randomIndex = Math.floor(Math.random() * targets.length);
    return targets[randomIndex].id;
  }, [gamePhase, getAlivePlayers, getRolePlayers]);
  
  // 女巫AI决策 - 救人/毒人
  const getWitchDecision = useCallback(() => {
    if (gamePhase !== GAME_PHASES.NIGHT) return null;
    
    const aliveWitch = getRolePlayers(ROLE_TYPES.WITCH);
    if (aliveWitch.length === 0) return null;
    
    const witch = aliveWitch[0];
    
    // 模拟女巫拥有的技能状态（实际项目中应该保存在玩家状态中）
    const hasSavePotion = !witch.usedSave; // 假设女巫还有解药
    const hasPoisonPotion = !witch.usedPoison; // 假设女巫还有毒药
    
    const result = { action: null, targetId: null };
    
    // 救人逻辑
    if (killedAtNight && hasSavePotion) {
      const killedPlayer = players.find(p => p.id === killedAtNight);
      
      // 不自救（简单AI逻辑）
      if (killedPlayer && killedPlayer.id !== witch.id) {
        // 特殊角色优先保护
        if (killedPlayer.role !== ROLE_TYPES.VILLAGER) {
          result.action = WITCH_POWERS.SAVE;
          result.targetId = killedAtNight;
          return result;
        }
        
        // 50%概率保护村民
        if (Math.random() > 0.5) {
          result.action = WITCH_POWERS.SAVE;
          result.targetId = killedAtNight;
          return result;
        }
      }
    }
    
    // 毒人逻辑
    if (hasPoisonPotion && day > 1) { // 第一晚不使用毒药
      // 有怀疑目标时才使用毒药（简单AI逻辑）
      if (Math.random() > 0.7) { // 30%概率使用毒药
        const targets = getAlivePlayers().filter(
          player => player.id !== witch.id
        );
        
        if (targets.length > 0) {
          const randomIndex = Math.floor(Math.random() * targets.length);
          result.action = WITCH_POWERS.POISON;
          result.targetId = targets[randomIndex].id;
          return result;
        }
      }
    }
    
    return result; // 不使用任何技能
  }, [gamePhase, getRolePlayers, players, killedAtNight, day, getAlivePlayers]);
  
  // 白天讨论阶段的AI发言
  const getAIDiscussion = useCallback((playerId) => {
    if (gamePhase !== GAME_PHASES.DAY_DISCUSSION) return null;
    
    const player = players.find(p => p.id === playerId && !p.isHuman);
    if (!player || player.status !== PLAYER_STATUS.ALIVE) return null;
    
    // 根据角色生成不同的发言
    switch (player.role) {
      case ROLE_TYPES.WEREWOLF:
        // 狼人伪装成好人
        return `我是一名${player.name}，我觉得大家要认真分析昨晚的情况，找出狼人。`;
        
      case ROLE_TYPES.SEER:
        // 预言家可以提供查验信息
        return `我是预言家，我查验了${player.name}，他是${Math.random() > 0.5 ? '好人' : '狼人'}。`;
        
      case ROLE_TYPES.WITCH:
        // 女巫可以提供救人/毒人信息
        return `我是女巫，昨晚${Math.random() > 0.5 ? '我没有使用任何药' : '我使用了解药救了一个人'}。`;
        
      case ROLE_TYPES.HUNTER:
        // 猎人可以威胁狼人
        return `作为猎人，如果我被杀，我会开枪带走最可疑的人。`;
        
      case ROLE_TYPES.VILLAGER:
      default:
        // 村民发表一般性言论
        return `大家仔细想想，谁最可疑，我们一定要找出狼人。`;
    }
  }, [gamePhase, players]);
  
  // 投票阶段的AI决策
  const getVoteDecision = useCallback((playerId) => {
    if (gamePhase !== GAME_PHASES.DAY_VOTE) return null;
    
    const player = players.find(p => p.id === playerId && !p.isHuman);
    if (!player || player.status !== PLAYER_STATUS.ALIVE) return null;
    
    const alivePlayers = getAlivePlayers();
    // 不能投自己
    const targets = alivePlayers.filter(p => p.id !== player.id);
    
    if (targets.length === 0) return null;
    
    // 狼人团队投票逻辑
    if (player.role === ROLE_TYPES.WEREWOLF) {
      // 狼人会尝试投票给非狼人玩家
      const nonWolfTargets = targets.filter(p => p.role !== ROLE_TYPES.WEREWOLF);
      
      if (nonWolfTargets.length > 0) {
        // 优先投特殊身份
        const specialRoles = nonWolfTargets.filter(
          p => p.role !== ROLE_TYPES.VILLAGER
        );
        
        if (specialRoles.length > 0) {
          const randomIndex = Math.floor(Math.random() * specialRoles.length);
          return specialRoles[randomIndex].id;
        }
        
        // 没有特殊身份，随机投村民
        const randomIndex = Math.floor(Math.random() * nonWolfTargets.length);
        return nonWolfTargets[randomIndex].id;
      }
    }
    
    // 好人阵营投票逻辑（预言家、女巫、猎人、村民）
    // 在实际游戏中，这里应该基于之前的游戏信息做出更复杂的决策
    // 简化版本：随机投票
    const randomIndex = Math.floor(Math.random() * targets.length);
    return targets[randomIndex].id;
    
  }, [gamePhase, players, getAlivePlayers]);
  
  return {
    getWolfDecision,
    getSeerDecision,
    getWitchDecision,
    getAIDiscussion,
    getVoteDecision,
  };
};

export default useAI; 