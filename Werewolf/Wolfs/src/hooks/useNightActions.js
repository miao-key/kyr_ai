import { useState, useCallback } from 'react';
import { 
  ROLE_TYPES,
  NIGHT_ACTION_ORDER,
  PLAYER_STATUS
} from '../constants/gameConstants';

const useNightActions = (
  players, 
  humanPlayer, 
  gamePhase,
  wolfKill,
  seerCheck,
  witchAction,
  nextPhase,
  addGameLog
) => {
  // 当前行动角色
  const [currentActionRole, setCurrentActionRole] = useState(null);
  
  // 预言家查验结果
  const [seerCheckResult, setSeerCheckResult] = useState(null);
  
  // 女巫使用技能情况
  const [witchSaveUsed, setWitchSaveUsed] = useState(false);
  const [witchPoisonUsed, setWitchPoisonUsed] = useState(false);
  
  // 重置夜晚状态
  const resetNightState = useCallback(() => {
    setCurrentActionRole(null);
    setSeerCheckResult(null);
  }, []);
  
  // 开始夜晚阶段
  const startNight = useCallback(() => {
    resetNightState();
    
    // 第一个行动的角色
    const firstRole = NIGHT_ACTION_ORDER[0];
    setCurrentActionRole(firstRole);
    
    // 显示对应角色的行动提示
    addGameLog(`请${getRoleDisplayName(firstRole)}行动`);
  }, [resetNightState, addGameLog]);
  
  // 获取角色的中文名称
  const getRoleDisplayName = (role) => {
    switch (role) {
      case ROLE_TYPES.WEREWOLF:
        return '狼人';
      case ROLE_TYPES.SEER:
        return '预言家';
      case ROLE_TYPES.WITCH:
        return '女巫';
      case ROLE_TYPES.HUNTER:
        return '猎人';
      case ROLE_TYPES.VILLAGER:
      default:
        return '村民';
    }
  };
  
  // 进行下一个角色的行动
  const proceedToNextRole = useCallback(() => {
    const currentIndex = NIGHT_ACTION_ORDER.findIndex(role => role === currentActionRole);
    
    if (currentIndex === -1 || currentIndex === NIGHT_ACTION_ORDER.length - 1) {
      // 所有角色行动结束，进入白天
      resetNightState();
      nextPhase();
      return;
    }
    
    // 进入下一个角色的行动
    const nextRole = NIGHT_ACTION_ORDER[currentIndex + 1];
    setCurrentActionRole(nextRole);
    addGameLog(`请${getRoleDisplayName(nextRole)}行动`);
  }, [currentActionRole, resetNightState, nextPhase, addGameLog]);
  
  // 执行狼人杀人
  const handleWolfKill = useCallback((targetId) => {
    if (currentActionRole !== ROLE_TYPES.WEREWOLF) return;
    
    wolfKill(targetId);
    proceedToNextRole();
  }, [currentActionRole, wolfKill, proceedToNextRole]);
  
  // 执行预言家查验
  const handleSeerCheck = useCallback((targetId) => {
    if (currentActionRole !== ROLE_TYPES.SEER) return;
    
    const isWolf = seerCheck(targetId);
    setSeerCheckResult({
      targetId,
      isWolf
    });
    
    proceedToNextRole();
  }, [currentActionRole, seerCheck, proceedToNextRole]);
  
  // 执行女巫行动
  const handleWitchAction = useCallback((actionType, targetId) => {
    if (currentActionRole !== ROLE_TYPES.WITCH) return;
    
    if (actionType === 'save') {
      setWitchSaveUsed(true);
    } else if (actionType === 'poison') {
      setWitchPoisonUsed(true);
    }
    
    witchAction(actionType, targetId);
    proceedToNextRole();
  }, [currentActionRole, witchAction, proceedToNextRole]);
  
  // 跳过当前角色的行动
  const skipCurrentAction = useCallback(() => {
    if (!currentActionRole) return;
    
    addGameLog(`${getRoleDisplayName(currentActionRole)}选择跳过行动`);
    proceedToNextRole();
  }, [currentActionRole, proceedToNextRole, addGameLog]);
  
  // 检查当前玩家是否可以行动
  const canHumanPlayerAct = useCallback(() => {
    if (!humanPlayer || humanPlayer.status !== PLAYER_STATUS.ALIVE) return false;
    
    return humanPlayer.role === currentActionRole;
  }, [humanPlayer, currentActionRole]);
  
  return {
    currentActionRole,
    seerCheckResult,
    witchSaveUsed,
    witchPoisonUsed,
    startNight,
    handleWolfKill,
    handleSeerCheck,
    handleWitchAction,
    skipCurrentAction,
    canHumanPlayerAct
  };
};

export default useNightActions; 