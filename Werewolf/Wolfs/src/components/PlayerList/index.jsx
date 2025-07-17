import { PLAYER_STATUS, ROLE_TYPES } from '../../constants/gameConstants';
import { getRoleDisplayName } from '../../utils/gameUtils';
import './styles.css';

const PlayerList = ({ 
  players, 
  humanPlayer, 
  gamePhase,
  onSelectPlayer,
  selectedPlayerId,
  canSelect = true
}) => {
  // 判断是否应该显示玩家角色信息
  const shouldShowRole = (player) => {
    // 自己始终可以看到自己的角色
    if (player.isHuman) return true;
    
    // 狼人可以看到其他狼人
    if (humanPlayer && humanPlayer.role === ROLE_TYPES.WEREWOLF && player.role === ROLE_TYPES.WEREWOLF) {
      return true;
    }
    
    // 死亡玩家角色公开
    if (player.status === PLAYER_STATUS.DEAD) {
      return true;
    }
    
    return false;
  };
  
  // 获取玩家显示的样式类
  const getPlayerClass = (player) => {
    let classes = ['player-item'];
    
    if (player.isHuman) {
      classes.push('is-human');
    }
    
    if (player.status === PLAYER_STATUS.DEAD) {
      classes.push('is-dead');
    }
    
    if (selectedPlayerId === player.id) {
      classes.push('is-selected');
    }
    
    return classes.join(' ');
  };
  
  const handleSelectPlayer = (playerId) => {
    if (!canSelect) return;
    
    // 不能选择自己
    if (humanPlayer && humanPlayer.id === playerId) return;
    
    // 不能选择已死玩家
    const player = players.find(p => p.id === playerId);
    if (player && player.status === PLAYER_STATUS.DEAD) return;
    
    onSelectPlayer && onSelectPlayer(playerId);
  };
  
  return (
    <div className="player-list-container">
      <h3>玩家列表</h3>
      <div className="player-list">
        {players.map(player => (
          <div 
            key={player.id} 
            className={getPlayerClass(player)}
            onClick={() => handleSelectPlayer(player.id)}
          >
            <div className="player-name">
              {player.name}
              {player.isHuman && <span className="human-tag">你</span>}
              {player.status === PLAYER_STATUS.DEAD && <span className="dead-tag">已死亡</span>}
            </div>
            
            {shouldShowRole(player) && (
              <div className="player-role">
                {getRoleDisplayName(player.role)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList; 