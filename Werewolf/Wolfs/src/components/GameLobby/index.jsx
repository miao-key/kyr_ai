import { useState } from 'react';
import { ROLE_TYPES } from '../../constants/gameConstants';
import { getRoleDisplayName, getPlayerRoleDescription } from '../../utils/gameUtils';
import './styles.css';

const GameLobby = ({ onStartGame }) => {
  const [playerName, setPlayerName] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [error, setError] = useState('');
  
  // 所有可选角色列表
  const availableRoles = Object.values(ROLE_TYPES);
  
  // 处理开始游戏按钮
  const handleStartGame = () => {
    if (!playerName.trim()) {
      setError('请输入您的名字');
      return;
    }
    
    // 如果选择了角色，则使用选择的角色；否则随机分配
    onStartGame(playerName, selectedRole);
  };
  
  // 处理角色选择
  const handleRoleSelect = (role) => {
    setSelectedRole(role === selectedRole ? null : role);
  };
  
  return (
    <div className="game-lobby">
      <h1>狼人杀 - 9人标准局</h1>
      <h2>游戏大厅</h2>
      
      <div className="player-setup">
        <div className="form-group">
          <label htmlFor="player-name">您的名字:</label>
          <input
            id="player-name"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="请输入您的名字"
          />
          {error && <p className="error-message">{error}</p>}
        </div>
        
        <div className="form-group">
          <label>选择角色（可选）:</label>
          <div className="role-selection">
            {availableRoles.map(role => (
              <button
                key={role}
                className={`role-button ${selectedRole === role ? 'selected' : ''}`}
                onClick={() => handleRoleSelect(role)}
              >
                {getRoleDisplayName(role)}
              </button>
            ))}
          </div>
          <p className="help-text">不选择则随机分配角色</p>
          
          <button 
            type="button" 
            className="info-button"
            onClick={() => setShowRoleInfo(!showRoleInfo)}
          >
            {showRoleInfo ? '隐藏角色信息' : '查看角色信息'}
          </button>
        </div>
        
        {showRoleInfo && (
          <div className="role-info">
            <h3>角色介绍</h3>
            <ul>
              {availableRoles.map(role => (
                <li key={role}>
                  <strong>{getRoleDisplayName(role)}:</strong> {getPlayerRoleDescription(role)}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="game-rules">
          <h3>游戏规则</h3>
          <p>9人标准无警徽流局：3狼、3民、1预言家、1女巫、1猎人</p>
          <ul>
            <li>狼人：每晚可以杀死一名玩家，目标是消灭所有好人</li>
            <li>预言家：每晚可以查验一名玩家的身份</li>
            <li>女巫：拥有一瓶解药和一瓶毒药，解药可以救活被狼人杀死的玩家（包括自己），毒药可以毒死一名玩家</li>
            <li>猎人：被杀时可以开枪带走一名玩家</li>
            <li>村民：没有特殊技能，需要通过推理找出狼人</li>
          </ul>
          <p>游戏流程：夜晚（角色行动）→ 白天讨论 → 投票</p>
          <p>获胜条件：狼人阵营 - 狼人数量大于等于好人；好人阵营 - 消灭所有狼人</p>
        </div>
      </div>
      
      <button 
        className="start-game-button" 
        onClick={handleStartGame}
      >
        开始游戏
      </button>
    </div>
  );
};

export default GameLobby; 