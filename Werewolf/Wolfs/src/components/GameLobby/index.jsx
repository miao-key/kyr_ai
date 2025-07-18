import { useState } from 'react';
import './styles.css';

function GameLobby({ onStartGame }) {
  const [playerName, setPlayerName] = useState('');
  const [selectedRole, setSelectedRole] = useState('random');
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (e) => {
    setPlayerName(e.target.value);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleStartGame = () => {
    if (!playerName.trim()) {
      setError('请输入你的名字');
      return;
    }
    
    onStartGame(playerName, selectedRole);
  };

  const toggleRoleInfo = () => {
    setShowRoleInfo(!showRoleInfo);
  };

  return (
    <div className="game-lobby">
      <div className="game-lobby-content">
        <h1>狼人杀</h1>
        <h2>9人标准局</h2>
        
        <div className="player-setup">
          <div className="form-group">
            <label htmlFor="player-name">
              <i className="fas fa-user"></i> 输入你的名字
            </label>
            <input
              type="text"
              id="player-name"
              value={playerName}
              onChange={handleNameChange}
              placeholder="输入你的名字..."
            />
            {error && <div className="error-message"><i className="fas fa-exclamation-circle"></i> {error}</div>}
          </div>
          
          <div className="form-group">
            <label>
              <i className="fas fa-mask"></i> 选择你的角色
            </label>
            <div className="role-selection">
              <button
                className={`role-button ${selectedRole === 'random' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('random')}
              >
                <i className="fas fa-random"></i> 随机
              </button>
              <button
                className={`role-button ${selectedRole === 'werewolf' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('werewolf')}
              >
                <i className="fas fa-wolf-pack-battalion"></i> 狼人
              </button>
              <button
                className={`role-button ${selectedRole === 'villager' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('villager')}
              >
                <i className="fas fa-users"></i> 村民
              </button>
              <button
                className={`role-button ${selectedRole === 'seer' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('seer')}
              >
                <i className="fas fa-eye"></i> 预言家
              </button>
              <button
                className={`role-button ${selectedRole === 'witch' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('witch')}
              >
                <i className="fas fa-flask"></i> 女巫
              </button>
              <button
                className={`role-button ${selectedRole === 'hunter' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('hunter')}
              >
                <i className="fas fa-crosshairs"></i> 猎人
              </button>
            </div>
            <p className="help-text">选择"随机"将从可用角色中随机分配一个角色给你</p>
          </div>
          
          <button className="info-button" onClick={toggleRoleInfo}>
            <i className="fas fa-info-circle"></i> 查看角色介绍
          </button>
          
          {showRoleInfo && (
            <div className="role-info">
              <h3><i className="fas fa-book"></i> 角色介绍</h3>
              <ul>
                <li><span className="role-icon werewolf"><i className="fas fa-wolf-pack-battalion"></i></span> <strong>狼人</strong>：每晚可以与其他狼人一起选择一名玩家击杀。目标是消灭所有好人。</li>
                <li><span className="role-icon villager"><i className="fas fa-users"></i></span> <strong>村民</strong>：没有特殊技能，依靠投票和推理找出狼人。</li>
                <li><span className="role-icon seer"><i className="fas fa-eye"></i></span> <strong>预言家</strong>：每晚可以查验一名玩家的真实身份（是否为狼人）。</li>
                <li><span className="role-icon witch"><i className="fas fa-flask"></i></span> <strong>女巫</strong>：拥有一瓶解药和一瓶毒药。解药可以救活当晚被狼人杀死的玩家，毒药可以毒死一名玩家。每种药仅能使用一次。</li>
                <li><span className="role-icon hunter"><i className="fas fa-crosshairs"></i></span> <strong>猎人</strong>：被淘汰时可以开枪带走一名玩家。</li>
              </ul>
            </div>
          )}
          
          <div className="game-rules">
            <h3><i className="fas fa-scroll"></i> 游戏规则</h3>
            <p>这是一个9人标准局无警徽流的狼人杀游戏，其中3名狼人，6名好人（1名预言家，1名女巫，1名猎人，3名普通村民）。</p>
            <ul>
              <li>游戏按照 夜晚-白天讨论-投票 的顺序进行</li>
              <li>狼人胜利条件：狼人数量 ≥ 好人数量</li>
              <li>好人胜利条件：消灭所有狼人</li>
            </ul>
          </div>
        </div>
        
        <button className="start-game-button" onClick={handleStartGame}>
          开始游戏
        </button>
      </div>
    </div>
  );
}

export default GameLobby; 