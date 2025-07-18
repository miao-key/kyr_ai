import React from 'react';
import { ROLE_TYPES } from '../../constants/gameConstants';
import './styles.css';

const NightActions = ({
  currentRole,
  players,
  targetPlayer,
  setTargetPlayer,
  handleSeerCheck,
  handleWitchSave,
  handleWitchPoison,
  skipWitchAction,
  handleWolfKill,
  isSaved,
  canSave,
  canPoison,
  poisonTarget,
  setPoisonTarget,
  handleNightEnd,
  nightVictim
}) => {
  // 根据当前角色渲染不同的操作界面
  const renderRoleActions = () => {
    switch (currentRole) {
      case ROLE_TYPES.WEREWOLF:
        return renderWerewolfActions();
      case ROLE_TYPES.SEER:
        return renderSeerActions();
      case ROLE_TYPES.WITCH:
        return renderWitchActions();
      default:
        return <div className="waiting-message">请等待其他玩家行动...</div>;
    }
  };

  // 狼人行动界面
  const renderWerewolfActions = () => {
    return (
      <div className="role-actions werewolf-actions">
        <h3>
          <i className="fas fa-wolf-pack-battalion"></i> 狼人行动
        </h3>
        <p className="action-description">请选择一名玩家击杀：</p>
        
        <div className="target-selection">
          {players
            .filter(p => p.role !== ROLE_TYPES.WEREWOLF && p.status === 'alive')
            .map(player => (
              <div
                key={player.id}
                className={`target-option ${targetPlayer === player.id ? 'selected' : ''}`}
                onClick={() => setTargetPlayer(player.id)}
              >
                <span className="target-name">{player.name}</span>
              </div>
            ))}
        </div>
        
        <button
          className="action-button kill-button"
          disabled={!targetPlayer}
          onClick={() => handleWolfKill(targetPlayer)}
        >
          <i className="fas fa-skull"></i> 确认击杀
        </button>
      </div>
    );
  };

  // 预言家行动界面
  const renderSeerActions = () => {
    return (
      <div className="role-actions seer-actions">
        <h3>
          <i className="fas fa-eye"></i> 预言家行动
        </h3>
        <p className="action-description">请选择一名玩家查验身份：</p>
        
        <div className="target-selection">
          {players
            .filter(p => p.id !== targetPlayer && p.status === 'alive')
            .map(player => (
              <div
                key={player.id}
                className={`target-option ${targetPlayer === player.id ? 'selected' : ''}`}
                onClick={() => setTargetPlayer(player.id)}
              >
                <span className="target-name">{player.name}</span>
              </div>
            ))}
        </div>
        
        <button
          className="action-button check-button"
          disabled={!targetPlayer}
          onClick={() => {
            const isWerewolf = handleSeerCheck(targetPlayer);
            alert(`${players.find(p => p.id === targetPlayer)?.name} 是${isWerewolf ? '狼人' : '好人'}`);
          }}
        >
          <i className="fas fa-search"></i> 查验身份
        </button>
      </div>
    );
  };

  // 女巫行动界面
  const renderWitchActions = () => {
    // 如果没有夜晚被杀的玩家，或者女巫已经用过解药，直接进入毒药选择阶段
    if (!nightVictim || !canSave) {
      return renderWitchPoisonActions();
    }
    
    const victim = players.find(p => p.id === nightVictim);
    
    return (
      <div className="role-actions witch-actions">
        <h3>
          <i className="fas fa-flask"></i> 女巫行动
        </h3>
        <p className="action-description">今晚 {victim?.name} 被杀，是否使用解药？</p>
        
        <div className="witch-options">
          <button 
            className="action-button save-button"
            onClick={() => {
              handleWitchSave();
              // 如果女巫已经用过毒药，直接结束行动
              if (!canPoison) {
                handleNightEnd();
              }
            }}
          >
            <i className="fas fa-heart"></i> 使用解药
          </button>
          
          <button 
            className="action-button skip-button"
            onClick={() => {
              // 如果女巫已经用过毒药，直接结束行动
              if (!canPoison) {
                skipWitchAction();
                handleNightEnd();
              } else {
                skipWitchAction();
              }
            }}
          >
            <i className="fas fa-times"></i> 不使用
          </button>
        </div>
      </div>
    );
  };

  // 女巫毒药选择界面
  const renderWitchPoisonActions = () => {
    if (!canPoison) {
      return (
        <div className="role-actions witch-actions">
          <h3>
            <i className="fas fa-flask"></i> 女巫行动
          </h3>
          <p className="action-description">你已经用过毒药了。</p>
          
          <button 
            className="action-button skip-button"
            onClick={skipWitchAction}
          >
            <i className="fas fa-check"></i> 结束行动
          </button>
        </div>
      );
    }
    
    return (
      <div className="role-actions witch-actions">
        <h3>
          <i className="fas fa-flask"></i> 女巫行动
        </h3>
        <p className="action-description">是否使用毒药？</p>
        
        <div className="target-selection">
          {players
            .filter(p => p.status === 'alive')
            .map(player => (
              <div
                key={player.id}
                className={`target-option ${poisonTarget === player.id ? 'selected' : ''}`}
                onClick={() => setPoisonTarget(player.id)}
              >
                <span className="target-name">{player.name}</span>
              </div>
            ))}
        </div>
        
        <div className="witch-options">
          <button 
            className="action-button poison-button"
            disabled={!poisonTarget}
            onClick={() => {
              handleWitchPoison(poisonTarget);
            }}
          >
            <i className="fas fa-skull-crossbones"></i> 使用毒药
          </button>
          
          <button 
            className="action-button skip-button"
            onClick={skipWitchAction}
          >
            <i className="fas fa-times"></i> 不使用
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="night-actions">
      <div className="night-background">
        <div className="moon"></div>
        <div className="stars"></div>
      </div>
      
      <div className="night-content">
        <h2>
          <i className="fas fa-moon"></i> 夜晚行动
        </h2>
        
        {renderRoleActions()}
      </div>
    </div>
  );
};

export default NightActions; 