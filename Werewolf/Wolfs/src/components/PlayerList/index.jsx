import React, { useEffect, useState, useCallback, memo } from 'react';
import { PLAYER_STATUS, ROLE_TYPES } from '../../constants/gameConstants';
import { getRoleDisplayName } from '../../utils/gameUtils';
import './styles.css';

const PlayerItem = memo(({ 
  player, 
  isSelected, 
  isCurrentTurn, 
  shouldShowRole, 
  onSelect,
  isSelectionEnabled
}) => {
  // 获取玩家显示的样式类
  const playerClass = [
    'player-item',
    player.isHuman ? 'is-human' : '',
    player.status === PLAYER_STATUS.DEAD ? 'is-dead' : '',
    isSelected ? 'is-selected' : '',
    isCurrentTurn ? 'current-turn' : ''
  ].filter(Boolean).join(' ');
  
  const handleClick = () => {
    if (!isSelectionEnabled) return;
    // 不能选择已死玩家
    if (player.status === PLAYER_STATUS.DEAD) return;
    onSelect(player.id);
  };
  
  return (
    <div 
      className={playerClass}
      onClick={handleClick}
    >
      <div className="player-name">
        {player.name}
        {player.isHuman && <span className="human-tag">你</span>}
        {player.status === PLAYER_STATUS.DEAD && <span className="dead-tag">已死亡</span>}
      </div>
      
      {shouldShowRole && (
        <div className="player-role">
          {getRoleDisplayName(player.role)}
        </div>
      )}
    </div>
  );
});

const PlayerList = ({ 
  players, 
  currentTurn,
  currentRole,
  gamePhase,
  selectedPlayer,
  onPlayerSelect,
  isSelectionEnabled = false
}) => {
  const [leftPlayers, setLeftPlayers] = useState([]);
  const [rightPlayers, setRightPlayers] = useState([]);
  
  // 当玩家列表更新时，随机打乱玩家位置
  useEffect(() => {
    if (!players || players.length === 0) return;
    
    // 创建玩家数组的副本并随机打乱
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // 分配到左侧5个，右侧4个
    setLeftPlayers(shuffledPlayers.slice(0, 5));
    setRightPlayers(shuffledPlayers.slice(5));
  }, [players]);

  // 判断是否应该显示玩家角色信息
  const shouldShowRole = useCallback((player) => {
    // 游戏结束时显示所有角色
    if (gamePhase === 'gameOver') return true;
    
    // 自己始终可以看到自己的角色
    if (player.isHuman) return true;
    
    // 狼人可以看到其他狼人
    if (currentRole === ROLE_TYPES.WEREWOLF && player.role === ROLE_TYPES.WEREWOLF) {
      return true;
    }
    
    // 死亡玩家角色公开
    if (player.status === PLAYER_STATUS.DEAD) {
      return true;
    }
    
    return false;
  }, [gamePhase, currentRole]);
  
  return (
    <div className="player-list-container">
      <h3>
        <i className="fas fa-users"></i> 玩家列表
      </h3>
      <div className="players-area">
        <div className="left-players">
          {leftPlayers.map(player => (
            <PlayerItem
              key={player.id}
              player={player}
              isSelected={selectedPlayer === player.id}
              isCurrentTurn={currentTurn === player.id}
              shouldShowRole={shouldShowRole(player)}
              onSelect={onPlayerSelect}
              isSelectionEnabled={isSelectionEnabled}
            />
          ))}
        </div>
        <div className="right-players">
          {rightPlayers.map(player => (
            <PlayerItem
              key={player.id}
              player={player}
              isSelected={selectedPlayer === player.id}
              isCurrentTurn={currentTurn === player.id}
              shouldShowRole={shouldShowRole(player)}
              onSelect={onPlayerSelect}
              isSelectionEnabled={isSelectionEnabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(PlayerList); 