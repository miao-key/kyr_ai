const PlayerList = ({ players, currentPlayer, gamePhase, onPlayerSelect, selectedTarget, actionType }) => {
  const canSelectPlayer = (player) => {
    if (!onPlayerSelect || !player.isAlive || player.id === currentPlayer?.id) {
      return false
    }

    // 根据行动类型限制可选择的玩家
    if (actionType === 'werewolf_kill' && player.role === 'WEREWOLF') {
      return false // 狼人不能杀狼人
    }

    return true
  }

  const getPlayerStatusIcon = (player) => {
    if (!player.isAlive) return '💀'
    
    switch (player.role) {
      case 'WEREWOLF': return '🐺'
      case 'SEER': return '🔮'
      case 'WITCH': return '🧙‍♀️'
      case 'HUNTER': return '🏹'
      case 'VILLAGER': return '👤'
      default: return '👤'
    }
  }

  const shouldShowRole = (player) => {
    // 游戏结束时显示所有角色
    if (gamePhase === 'game_over') return true
    
    // 当前玩家总是能看到自己的角色
    if (player.id === currentPlayer?.id) return true
    
    // 狼人可以看到其他狼人的身份
    if (currentPlayer?.role === 'WEREWOLF' && player.role === 'WEREWOLF') {
      return true
    }
    
    return false
  }

  const getPlayerDisplayName = (player) => {
    if (shouldShowRole(player)) {
      const roleIcon = getPlayerStatusIcon(player)
      const teamMark = currentPlayer?.role === 'WEREWOLF' && player.role === 'WEREWOLF' && player.id !== currentPlayer.id ? ' 🐺' : ''
      return `${roleIcon} ${player.name}${teamMark}`
    }
    return `${getPlayerStatusIcon(player)} ${player.name}`
  }

  return (
    <div className="players-grid">
      {players.map(player => (
        <div
          key={player.id}
          className={`player-card ${
            !player.isAlive ? 'dead' : ''
          } ${
            player.id === currentPlayer?.id ? 'current-player' : ''
          } ${
            selectedTarget === player.id ? 'selected' : ''
          } ${
            canSelectPlayer(player) ? 'selectable' : ''
          } ${
            currentPlayer?.role === 'WEREWOLF' && player.role === 'WEREWOLF' && player.id !== currentPlayer.id ? 'werewolf-teammate' : ''
          }`}
          onClick={() => canSelectPlayer(player) && onPlayerSelect(player.id)}
        >
          <div className="player-info">
            <div className="player-name">{getPlayerDisplayName(player)}</div>
            <div className="player-id">#{player.id}</div>
            {player.isAI && (
              <div className="ai-badge">AI</div>
            )}
            {player.personality && (
              <div className="personality-badge">{player.personality.type}</div>
            )}
          </div>
          
          {player.votes > 0 && (
            <div className="vote-count">
              票数: {player.votes}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default PlayerList