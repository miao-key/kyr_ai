import { useState } from 'react'
import { ROLES } from '../../constants/gameConstants'

const GameLobby = ({ onStartGame, customRoles, setCustomRoles, selectedRole, setSelectedRole }) => {
  const [showRoleSelection, setShowRoleSelection] = useState(false)

  const handleStartGame = () => {
    onStartGame()
  }

  const handleCustomRoleToggle = () => {
    setCustomRoles(!customRoles)
    if (!customRoles) {
      setShowRoleSelection(true)
    } else {
      setShowRoleSelection(false)
      setSelectedRole(null)
    }
  }

  return (
    <div className="game-lobby">
      <div className="lobby-header">
        <h1>🐺 狼人杀游戏 🌙</h1>
        <p className="game-description">
          经典9人局狼人杀，体验紧张刺激的推理对抗！
        </p>
      </div>

      <div className="game-features">
        <h3>🎮 游戏特色</h3>
        <ul>
          <li>🤖 智能AI玩家，真实游戏体验</li>
          <li>🎭 多样化角色，策略丰富</li>
          <li>💬 AI个性化发言，增强沉浸感</li>
          <li>🔍 完整的游戏流程和规则</li>
          <li>🐺 狼人团队协作，可看到队友身份并共同决策</li>
          <li>🎯 AI狼人智能谎报身份，增强游戏策略性</li>
        </ul>
      </div>

      <div className="role-config">
        <h3>🎭 角色配置</h3>
        <div className="roles-grid">
          {Object.entries(ROLES).map(([roleKey, roleData]) => (
            <div key={roleKey} className="role-card">
              <div className="role-name">{roleData.name}</div>
              <div className="role-count">x{roleData.count}</div>
              <div className="role-description">{roleData.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="custom-role-section">
        <label className="custom-role-toggle">
          <input
            type="checkbox"
            checked={customRoles}
            onChange={handleCustomRoleToggle}
          />
          <span>自定义角色（选择你想要的角色）</span>
        </label>

        {showRoleSelection && (
          <div className="role-selection">
            <h4>选择你的角色：</h4>
            <div className="role-buttons">
              {Object.entries(ROLES).map(([roleKey, roleData]) => (
                <button
                  key={roleKey}
                  className={`role-button ${selectedRole === roleKey ? 'selected' : ''}`}
                  onClick={() => setSelectedRole(roleKey)}
                >
                  {roleData.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="start-section">
        <button 
          className="start-button"
          onClick={handleStartGame}
          disabled={customRoles && !selectedRole}
        >
          🎮 开始游戏
        </button>
        {customRoles && !selectedRole && (
          <p className="warning">请先选择一个角色</p>
        )}
      </div>
    </div>
  )
}

export default GameLobby