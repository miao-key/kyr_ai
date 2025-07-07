import PlayerList from '../PlayerList'

const GameOver = ({ winner, players, onRestart, gameLog }) => {
  const getWinnerMessage = () => {
    switch (winner) {
      case 'werewolves':
        return {
          title: '🐺 狼人胜利！',
          message: '狼人成功消灭了所有好人！',
          className: 'werewolf-victory'
        }
      case 'villagers':
        return {
          title: '👥 好人胜利！',
          message: '好人成功找出了所有狼人！',
          className: 'villager-victory'
        }
      default:
        return {
          title: '🎮 游戏结束',
          message: '游戏已结束',
          className: 'game-end'
        }
    }
  }

  const winnerInfo = getWinnerMessage()
  const werewolves = players.filter(p => p.role === 'WEREWOLF')
  const villagers = players.filter(p => p.role !== 'WEREWOLF')

  return (
    <div className="game-over">
      <div className={`victory-banner ${winnerInfo.className}`}>
        <h1>{winnerInfo.title}</h1>
        <p>{winnerInfo.message}</p>
      </div>

      <div className="game-summary">
        <div className="teams-reveal">
          <div className="team-section">
            <h3>🐺 狼人阵营</h3>
            <div className="team-players">
              {werewolves.map(player => (
                <div key={player.id} className={`player-reveal ${!player.isAlive ? 'dead' : ''}`}>
                  <span className="player-name">{player.name}</span>
                  <span className="player-role">狼人</span>
                  <span className="player-status">{player.isAlive ? '存活' : '死亡'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="team-section">
            <h3>👥 好人阵营</h3>
            <div className="team-players">
              {villagers.map(player => {
                const roleNames = {
                  'VILLAGER': '村民',
                  'SEER': '预言家',
                  'WITCH': '女巫',
                  'HUNTER': '猎人'
                }
                return (
                  <div key={player.id} className={`player-reveal ${!player.isAlive ? 'dead' : ''}`}>
                    <span className="player-name">{player.name}</span>
                    <span className="player-role">{roleNames[player.role]}</span>
                    <span className="player-status">{player.isAlive ? '存活' : '死亡'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="all-players">
          <h3>🎭 所有玩家身份</h3>
          <PlayerList
            players={players}
            currentPlayer={null}
            gamePhase="game_over"
          />
        </div>

        <div className="game-stats">
          <h3>📊 游戏统计</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">总玩家数：</span>
              <span className="stat-value">{players.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">存活玩家：</span>
              <span className="stat-value">{players.filter(p => p.isAlive).length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">死亡玩家：</span>
              <span className="stat-value">{players.filter(p => !p.isAlive).length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">游戏日志条数：</span>
              <span className="stat-value">{gameLog.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="game-actions">
        <button className="restart-button" onClick={onRestart}>
          🔄 重新开始
        </button>
      </div>
    </div>
  )
}

export default GameOver