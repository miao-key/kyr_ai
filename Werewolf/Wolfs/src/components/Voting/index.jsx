import { useState, useEffect } from 'react';
import { GAME_PHASES, PLAYER_STATUS } from '../../constants/gameConstants';
import PlayerList from '../PlayerList';
import './styles.css';

const Voting = ({ 
  gamePhase, 
  players, 
  humanPlayer, 
  onVote,
  onVoteComplete
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [votes, setVotes] = useState([]);
  const [voteCompleted, setVoteCompleted] = useState(false);
  const [voteResults, setVoteResults] = useState({});
  const [eliminatedPlayer, setEliminatedPlayer] = useState(null);
  
  // 监听游戏阶段变化，重置投票状态
  useEffect(() => {
    if (gamePhase === GAME_PHASES.DAY_VOTE) {
      setSelectedPlayerId(null);
      setVotes([]);
      setVoteCompleted(false);
      setVoteResults({});
      setEliminatedPlayer(null);
    }
  }, [gamePhase]);
  
  // AI自动投票
  useEffect(() => {
    if (gamePhase !== GAME_PHASES.DAY_VOTE || voteCompleted) return;
    
    // 设置AI投票的延时
    const timer = setTimeout(() => {
      const newVotes = [...votes];
      
      // 让所有AI玩家投票
      players.forEach(player => {
        // 如果不是人类玩家且还活着且还没投票
        if (!player.isHuman && player.status === PLAYER_STATUS.ALIVE && 
            !votes.find(v => v.voterId === player.id)) {
          
          // 获取可投票的玩家列表（除自己外的存活玩家）
          const targets = players.filter(
            p => p.id !== player.id && p.status === PLAYER_STATUS.ALIVE
          );
          
          if (targets.length > 0) {
            // 随机选择一个目标投票
            const randomIndex = Math.floor(Math.random() * targets.length);
            const targetId = targets[randomIndex].id;
            
            newVotes.push({
              voterId: player.id,
              voterName: player.name,
              targetId,
              targetName: players.find(p => p.id === targetId)?.name || '未知玩家'
            });
          }
        }
      });
      
      setVotes(newVotes);
      
      // 检查是否所有存活玩家都已投票
      const alivePlayers = players.filter(p => p.status === PLAYER_STATUS.ALIVE);
      if (newVotes.length >= alivePlayers.length) {
        completeVoting(newVotes);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [gamePhase, players, votes, voteCompleted]);
  
  // 处理玩家选择
  const handleSelectPlayer = (playerId) => {
    setSelectedPlayerId(playerId);
  };
  
  // 提交玩家投票
  const submitVote = () => {
    if (!selectedPlayerId || !humanPlayer) return;
    
    const humanVote = {
      voterId: humanPlayer.id,
      voterName: humanPlayer.name,
      targetId: selectedPlayerId,
      targetName: players.find(p => p.id === selectedPlayerId)?.name || '未知玩家'
    };
    
    const newVotes = [...votes.filter(v => v.voterId !== humanPlayer.id), humanVote];
    setVotes(newVotes);
    
    // 检查是否所有存活玩家都已投票
    const alivePlayers = players.filter(p => p.status === PLAYER_STATUS.ALIVE);
    if (newVotes.length >= alivePlayers.length) {
      completeVoting(newVotes);
    }
    
    // 提交投票
    onVote && onVote(selectedPlayerId);
    
    // 重置选择
    setSelectedPlayerId(null);
  };
  
  // 完成投票流程
  const completeVoting = (finalVotes) => {
    setVoteCompleted(true);
    
    // 统计票数
    const results = {};
    finalVotes.forEach(vote => {
      if (!results[vote.targetId]) {
        results[vote.targetId] = {
          id: vote.targetId,
          name: vote.targetName,
          votes: 0,
          voters: []
        };
      }
      results[vote.targetId].votes++;
      results[vote.targetId].voters.push(vote.voterName);
    });
    
    setVoteResults(results);
    
    // 找出票数最多的玩家
    let maxVotes = 0;
    let eliminatedId = null;
    
    Object.values(results).forEach(result => {
      if (result.votes > maxVotes) {
        maxVotes = result.votes;
        eliminatedId = result.id;
      }
    });
    
    if (eliminatedId) {
      setEliminatedPlayer(players.find(p => p.id === eliminatedId));
    }
    
    // 延迟通知游戏状态更新
    setTimeout(() => {
      onVoteComplete && onVoteComplete(finalVotes);
    }, 3000);
  };
  
  // 如果当前不是投票阶段，不渲染任何内容
  if (gamePhase !== GAME_PHASES.DAY_VOTE) {
    return null;
  }
  
  return (
    <div className="voting-container">
      <h2>投票阶段</h2>
      
      {!voteCompleted ? (
        <div className="voting-active">
          <p className="voting-instruction">请选择一位玩家投票，得票最多的玩家将被淘汰:</p>
          
          {humanPlayer && humanPlayer.status === PLAYER_STATUS.ALIVE && !votes.find(v => v.voterId === humanPlayer.id) && (
            <>
              <PlayerList 
                players={players}
                humanPlayer={humanPlayer}
                gamePhase={gamePhase}
                onSelectPlayer={handleSelectPlayer}
                selectedPlayerId={selectedPlayerId}
              />
              
              <button 
                className="vote-button"
                disabled={!selectedPlayerId}
                onClick={submitVote}
              >
                确认投票
              </button>
            </>
          )}
          
          <div className="current-votes">
            <h3>当前投票情况:</h3>
            {votes.length === 0 ? (
              <p>还没有玩家投票</p>
            ) : (
              <ul className="vote-list">
                {votes.map((vote, index) => (
                  <li key={index} className="vote-item">
                    {vote.voterName} 投给了 {vote.targetName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="voting-results">
          <h3>投票结果:</h3>
          <div className="results-container">
            {Object.values(voteResults).map((result) => (
              <div 
                key={result.id} 
                className={`result-item ${eliminatedPlayer && eliminatedPlayer.id === result.id ? 'eliminated' : ''}`}
              >
                <div className="result-name">{result.name}</div>
                <div className="result-votes">{result.votes} 票</div>
                <div className="result-voters">
                  投票者: {result.voters.join(', ')}
                </div>
              </div>
            ))}
          </div>
          
          {eliminatedPlayer && (
            <div className="eliminated-announcement">
              <h3>{eliminatedPlayer.name} 被投票出局</h3>
            </div>
          )}
          
          <p className="next-phase-message">即将进入下一阶段...</p>
        </div>
      )}
    </div>
  );
};

export default Voting; 