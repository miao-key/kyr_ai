import { useState } from 'react'
import PlayerList from '../PlayerList'

const Voting = ({ 
  players, 
  currentPlayer, 
  votes, 
  onVote, 
  onProcessVoting,
  votingResults,
  isProcessingAI
}) => {
  const [selectedVote, setSelectedVote] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)

  const handlePlayerSelect = (playerId) => {
    if (!hasVoted) {
      setSelectedVote(playerId)
    }
  }

  const handleVoteConfirm = () => {
    if (selectedVote && !hasVoted) {
      onVote(selectedVote)
      setHasVoted(true)
      setSelectedVote(null)
    }
  }

  const getVoteCount = (playerId) => {
    return Object.values(votes).filter(vote => vote === playerId).length
  }

  const alivePlayers = players.filter(p => p.isAlive)
  const totalVotes = Object.keys(votes).length
  const expectedVotes = alivePlayers.length

  return (
    <div className="voting-section">
      <div className="voting-header">
        <h3>🗳️ 投票阶段</h3>
        <p>请投票选择你认为是狼人的玩家</p>
        <div className="vote-progress">
          <span>投票进度: {totalVotes}/{expectedVotes}</span>
        </div>
      </div>

      {!hasVoted && (
        <div className="vote-selection">
          <h4>选择你要投票的玩家：</h4>
          <PlayerList
            players={players}
            currentPlayer={currentPlayer}
            onPlayerSelect={handlePlayerSelect}
            selectedTarget={selectedVote}
            actionType="vote"
          />
          
          <div className="vote-buttons">
            <button
              className="vote-confirm-button"
              onClick={handleVoteConfirm}
              disabled={!selectedVote}
            >
              🗳️ 确认投票
            </button>
          </div>
        </div>
      )}

      {hasVoted && (
        <div className="vote-completed">
          <p>✅ 你已完成投票，等待其他玩家...</p>
        </div>
      )}

      {isProcessingAI && (
        <div className="ai-voting">
          <p>🤖 AI玩家正在投票...</p>
        </div>
      )}

      <div className="vote-status">
        <h4>当前投票情况：</h4>
        <div className="vote-summary">
          {alivePlayers.map(player => {
            const voteCount = getVoteCount(player.id)
            return (
              <div key={player.id} className="vote-item">
                <span className="player-name">{player.name}</span>
                <span className="vote-count">{voteCount} 票</span>
                {voteCount > 0 && (
                  <div className="vote-bar">
                    <div 
                      className="vote-fill" 
                      style={{ width: `${(voteCount / expectedVotes) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {totalVotes === expectedVotes && (
        <div className="voting-complete">
          <button
            className="process-voting-button"
            onClick={onProcessVoting}
          >
            📊 统计投票结果
          </button>
        </div>
      )}

      {votingResults && (
        <div className="voting-results">
          <h4>投票结果：</h4>
          {votingResults.eliminated ? (
            <p className="elimination-result">
              🚫 {votingResults.eliminated.name} 被投票出局！
            </p>
          ) : (
            <p className="tie-result">
              🤝 投票平局，无人出局
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default Voting