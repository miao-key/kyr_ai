import { useState, useEffect } from 'react';
import { 
  ROLE_TYPES, 
  GAME_PHASES, 
  PLAYER_STATUS,
  WITCH_POWERS
} from '../../constants/gameConstants';
import { getRoleDisplayName } from '../../utils/gameUtils';
import PlayerList from '../PlayerList';
import './styles.css';

const NightActions = ({ 
  gamePhase, 
  players, 
  humanPlayer, 
  currentActionRole,
  killedAtNight,
  witchSaveUsed,
  witchPoisonUsed,
  onWolfKill,
  onSeerCheck,
  onWitchAction,
  onSkipAction,
  seerCheckResult
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [witchAction, setWitchAction] = useState(null);
  const [checkResult, setCheckResult] = useState(null);
  
  // 夜晚过程中，AI玩家的动作会自动执行
  useEffect(() => {
    // 当前不是夜晚阶段，不执行任何操作
    if (gamePhase !== GAME_PHASES.NIGHT) return;
    
    // 没有当前行动角色
    if (!currentActionRole) return;
    
    // 如果当前行动角色是人类玩家，由玩家手动操作
    if (humanPlayer && humanPlayer.role === currentActionRole && humanPlayer.status === PLAYER_STATUS.ALIVE) {
      return;
    }
    
    // 设置AI自动执行操作的延时
    const timer = setTimeout(() => {
      // AI自动执行操作...在真实项目中，这里应该调用AI决策逻辑
      // 简化版本：直接跳过
      onSkipAction();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [gamePhase, currentActionRole, humanPlayer, players, onSkipAction]);
  
  // 当玩家角色变化时，重置选择状态
  useEffect(() => {
    setSelectedPlayerId(null);
    setWitchAction(null);
  }, [currentActionRole]);
  
  // 当获得预言家查验结果时
  useEffect(() => {
    if (seerCheckResult) {
      const targetPlayer = players.find(p => p.id === seerCheckResult.targetId);
      if (targetPlayer) {
        setCheckResult({
          name: targetPlayer.name,
          isWolf: seerCheckResult.isWolf
        });
      }
    } else {
      setCheckResult(null);
    }
  }, [seerCheckResult, players]);
  
  // 处理玩家选择
  const handleSelectPlayer = (playerId) => {
    setSelectedPlayerId(playerId);
  };
  
  // 执行当前角色的行动
  const executeAction = () => {
    if (!selectedPlayerId && !witchAction) return;
    
    switch (currentActionRole) {
      case ROLE_TYPES.WEREWOLF:
        onWolfKill(selectedPlayerId);
        break;
        
      case ROLE_TYPES.SEER:
        onSeerCheck(selectedPlayerId);
        break;
        
      case ROLE_TYPES.WITCH:
        if (witchAction === WITCH_POWERS.SAVE) {
          onWitchAction(WITCH_POWERS.SAVE, killedAtNight);
        } else if (witchAction === WITCH_POWERS.POISON && selectedPlayerId) {
          onWitchAction(WITCH_POWERS.POISON, selectedPlayerId);
        }
        break;
        
      default:
        onSkipAction();
        break;
    }
    
    // 重置状态
    setSelectedPlayerId(null);
    setWitchAction(null);
  };
  
  // 跳过当前行动
  const skipAction = () => {
    onSkipAction();
    setSelectedPlayerId(null);
    setWitchAction(null);
  };
  
  // 如果当前不是夜晚阶段，不渲染任何内容
  if (gamePhase !== GAME_PHASES.NIGHT) {
    return null;
  }
  
  // 如果人类玩家已经死亡，显示简化界面
  if (humanPlayer && humanPlayer.status !== PLAYER_STATUS.ALIVE) {
    return (
      <div className="night-actions-container">
        <h2>夜晚行动</h2>
        <p>你已经死亡，无法参与夜晚行动</p>
        <p>当前行动角色: {getRoleDisplayName(currentActionRole)}</p>
      </div>
    );
  }
  
  // 如果当前行动角色不是人类玩家的角色，显示旁观者界面
  if (humanPlayer && humanPlayer.role !== currentActionRole) {
    return (
      <div className="night-actions-container">
        <h2>夜晚行动</h2>
        <p>当前行动角色: {getRoleDisplayName(currentActionRole)}</p>
        <p>请等待其他玩家行动...</p>
      </div>
    );
  }
  
  // 根据当前行动角色渲染不同的操作界面
  return (
    <div className="night-actions-container">
      <h2>夜晚行动 - {getRoleDisplayName(currentActionRole)}</h2>
      
      {currentActionRole === ROLE_TYPES.WEREWOLF && (
        <div className="action-panel wolf-action">
          <p className="action-instruction">请选择一名玩家进行击杀:</p>
          <PlayerList 
            players={players}
            humanPlayer={humanPlayer}
            gamePhase={gamePhase}
            onSelectPlayer={handleSelectPlayer}
            selectedPlayerId={selectedPlayerId}
          />
          
          <div className="action-buttons">
            <button 
              className="action-button"
              disabled={!selectedPlayerId}
              onClick={executeAction}
            >
              确认击杀
            </button>
            <button 
              className="skip-button"
              onClick={skipAction}
            >
              跳过
            </button>
          </div>
        </div>
      )}
      
      {currentActionRole === ROLE_TYPES.SEER && (
        <div className="action-panel seer-action">
          <p className="action-instruction">请选择一名玩家查验身份:</p>
          <PlayerList 
            players={players}
            humanPlayer={humanPlayer}
            gamePhase={gamePhase}
            onSelectPlayer={handleSelectPlayer}
            selectedPlayerId={selectedPlayerId}
          />
          
          {checkResult && (
            <div className="check-result">
              <p>
                查验结果: {checkResult.name} 是
                <span className={checkResult.isWolf ? 'is-wolf' : 'is-villager'}>
                  {checkResult.isWolf ? '狼人' : '好人'}
                </span>
              </p>
            </div>
          )}
          
          <div className="action-buttons">
            <button 
              className="action-button"
              disabled={!selectedPlayerId}
              onClick={executeAction}
            >
              确认查验
            </button>
            <button 
              className="skip-button"
              onClick={skipAction}
            >
              跳过
            </button>
          </div>
        </div>
      )}
      
      {currentActionRole === ROLE_TYPES.WITCH && (
        <div className="action-panel witch-action">
          <p className="action-instruction">女巫行动:</p>
          
          {/* 解药选项 */}
          {!witchSaveUsed && killedAtNight && (
            <div className="witch-option">
              <p>今晚 {players.find(p => p.id === killedAtNight)?.name || '未知玩家'} 被杀，是否使用解药？</p>
              <button 
                className={`witch-button ${witchAction === WITCH_POWERS.SAVE ? 'selected' : ''}`}
                onClick={() => setWitchAction(WITCH_POWERS.SAVE)}
                disabled={witchSaveUsed}
              >
                使用解药
              </button>
            </div>
          )}
          
          {/* 毒药选项 */}
          {!witchPoisonUsed && (
            <div className="witch-option">
              <p>是否使用毒药？</p>
              <button 
                className={`witch-button ${witchAction === WITCH_POWERS.POISON ? 'selected' : ''}`}
                onClick={() => setWitchAction(WITCH_POWERS.POISON)}
                disabled={witchPoisonUsed}
              >
                使用毒药
              </button>
              
              {witchAction === WITCH_POWERS.POISON && (
                <div className="poison-target">
                  <p>请选择毒杀目标:</p>
                  <PlayerList 
                    players={players}
                    humanPlayer={humanPlayer}
                    gamePhase={gamePhase}
                    onSelectPlayer={handleSelectPlayer}
                    selectedPlayerId={selectedPlayerId}
                  />
                </div>
              )}
            </div>
          )}
          
          <div className="action-buttons">
            <button 
              className="action-button"
              disabled={
                !witchAction || 
                (witchAction === WITCH_POWERS.POISON && !selectedPlayerId)
              }
              onClick={executeAction}
            >
              确认使用
            </button>
            <button 
              className="skip-button"
              onClick={skipAction}
            >
              不使用
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NightActions; 