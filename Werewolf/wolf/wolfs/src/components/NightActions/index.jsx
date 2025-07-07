import { useState } from 'react'
import PlayerList from '../PlayerList'

const NightActions = ({ 
  currentPlayer, 
  players, 
  nightActions, 
  onNightAction, 
  onProcessNight,
  seerResult,
  witchUsedSave,
  witchUsedPoison,
  hunterCanShoot,
  onHunterShoot
}) => {
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [currentAction, setCurrentAction] = useState(null)

  const handlePlayerSelect = (playerId) => {
    setSelectedTarget(playerId)
  }

  const handleActionConfirm = () => {
    if (selectedTarget && currentAction) {
      onNightAction(currentAction, selectedTarget)
      setSelectedTarget(null)
      setCurrentAction(null)
    }
  }

  const handleSkipAction = () => {
    setCurrentAction(null)
    setSelectedTarget(null)
  }

  const canPerformAction = (actionType) => {
    switch (actionType) {
      case 'werewolf_kill':
        return currentPlayer?.role === 'WEREWOLF' && !nightActions.werewolf_kill
      case 'seer_check':
        return currentPlayer?.role === 'SEER' && !nightActions.seer_check
      case 'witch_save':
        return currentPlayer?.role === 'WITCH' && !witchUsedSave && nightActions.werewolf_kill
      case 'witch_poison':
        return currentPlayer?.role === 'WITCH' && !witchUsedPoison
      default:
        return false
    }
  }

  const getActionDescription = (actionType) => {
    switch (actionType) {
      case 'werewolf_kill':
        return '选择一名玩家进行击杀'
      case 'seer_check':
        return '选择一名玩家进行查验'
      case 'witch_save':
        return '选择是否救治被击杀的玩家'
      case 'witch_poison':
        return '选择一名玩家使用毒药'
      default:
        return ''
    }
  }

  // 猎人开枪界面
  if (hunterCanShoot) {
    return (
      <div className="night-actions">
        <div className="action-header">
          <h3>🏹 猎人开枪</h3>
          <p>猎人被杀，可以开枪带走一名玩家</p>
        </div>
        
        <PlayerList
          players={players}
          currentPlayer={currentPlayer}
          onPlayerSelect={handlePlayerSelect}
          selectedTarget={selectedTarget}
          actionType="hunter_shoot"
        />
        
        <div className="action-buttons">
          <button
            className="confirm-button"
            onClick={() => onHunterShoot(selectedTarget)}
            disabled={!selectedTarget}
          >
            🎯 开枪
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="night-actions">
      <div className="night-header">
        <h3>🌙 夜晚行动</h3>
        <p>请选择你的行动...</p>
      </div>

      {/* 狼人行动 */}
      {currentPlayer?.role === 'WEREWOLF' && (
        <div className="werewolf-section">
          <div className="team-info">
            <h4>🐺 狼人团队</h4>
            <p>你的队友：{players.filter(p => p.role === 'WEREWOLF' && p.id !== currentPlayer.id).map(p => p.name).join(', ')}</p>
            <p className="decision-note">💡 团队决策：请与队友商议选择击杀目标</p>
          </div>
          
          {canPerformAction('werewolf_kill') && (
            <div className="action-section">
              <button
                className={`action-button ${currentAction === 'werewolf_kill' ? 'active' : ''}`}
                onClick={() => setCurrentAction('werewolf_kill')}
              >
                🗡️ 击杀玩家
              </button>
              {currentAction === 'werewolf_kill' && (
                <p className="action-description">{getActionDescription('werewolf_kill')}</p>
              )}
            </div>
          )}
          
          {nightActions.werewolf_kill && (
            <div className="completed-action">
              ✅ 已选择击杀目标
            </div>
          )}
        </div>
      )}

      {/* 预言家行动 */}
      {currentPlayer?.role === 'SEER' && (
        <div className="seer-section">
          <h4>🔮 预言家</h4>
          {canPerformAction('seer_check') && (
            <div className="action-section">
              <button
                className={`action-button ${currentAction === 'seer_check' ? 'active' : ''}`}
                onClick={() => setCurrentAction('seer_check')}
              >
                🔍 查验身份
              </button>
              {currentAction === 'seer_check' && (
                <p className="action-description">{getActionDescription('seer_check')}</p>
              )}
            </div>
          )}
          
          {seerResult && (
            <div className="seer-result">
              <h5>查验结果：</h5>
              <p>{seerResult.playerName} 是 {seerResult.isWerewolf ? '狼人' : '好人'}</p>
            </div>
          )}
        </div>
      )}

      {/* 女巫行动 */}
      {currentPlayer?.role === 'WITCH' && (
        <div className="witch-section">
          <h4>🧙‍♀️ 女巫</h4>
          
          {canPerformAction('witch_save') && (
            <div className="action-section">
              <button
                className={`action-button ${currentAction === 'witch_save' ? 'active' : ''}`}
                onClick={() => setCurrentAction('witch_save')}
              >
                💊 使用解药
              </button>
              {currentAction === 'witch_save' && (
                <p className="action-description">救治被狼人击杀的玩家</p>
              )}
            </div>
          )}
          
          {canPerformAction('witch_poison') && (
            <div className="action-section">
              <button
                className={`action-button ${currentAction === 'witch_poison' ? 'active' : ''}`}
                onClick={() => setCurrentAction('witch_poison')}
              >
                ☠️ 使用毒药
              </button>
              {currentAction === 'witch_poison' && (
                <p className="action-description">{getActionDescription('witch_poison')}</p>
              )}
            </div>
          )}
          
          <div className="witch-status">
            <p>解药状态: {witchUsedSave ? '已使用' : '可用'}</p>
            <p>毒药状态: {witchUsedPoison ? '已使用' : '可用'}</p>
          </div>
        </div>
      )}

      {/* 玩家选择界面 */}
      {currentAction && (
        <div className="player-selection">
          <h4>选择目标玩家</h4>
          <PlayerList
            players={players}
            currentPlayer={currentPlayer}
            onPlayerSelect={handlePlayerSelect}
            selectedTarget={selectedTarget}
            actionType={currentAction}
          />
          
          <div className="action-buttons">
            <button
              className="confirm-button"
              onClick={handleActionConfirm}
              disabled={!selectedTarget}
            >
              ✅ 确认
            </button>
            <button
              className="skip-button"
              onClick={handleSkipAction}
            >
              ⏭️ 跳过
            </button>
          </div>
        </div>
      )}

      {/* 完成夜晚行动 */}
      {!currentAction && (
        <div className="night-complete">
          <button
            className="process-night-button"
            onClick={onProcessNight}
          >
            🌅 结束夜晚
          </button>
        </div>
      )}
    </div>
  )
}

export default NightActions