import { useState } from 'react';
import './App.css';
import GameLobby from './components/GameLobby';
import PlayerList from './components/PlayerList';
import GameLog from './components/GameLog';
import NightActions from './components/NightActions';
import Voting from './components/Voting';
import GameOver from './components/GameOver';
import useGameState from './hooks/useGameState';

function App() {
  const {
    gamePhase,
    players,
    currentDay,
    logs,
    handleDayDiscussion,
    startGame,
    restartGame,
    currentMessage,
    setCurrentMessage,
    sendMessage,
    votedPlayer,
    setVotedPlayer,
    finishVoting,
    hasHumanVoted,
    targetPlayer,
    setTargetPlayer,
    handleSeerCheck,
    handleWitchSave,
    handleWitchPoison,
    skipWitchAction,
    handleWolfKill,
    isSaved,
    canSave,
    canPoison,
    poisonTarget,
    setPoisonTarget,
    currentRole,
    currentTurn,
    handleNightEnd,
    nightVictim,
    gameWinner,
    activePlayers,
    eliminatedPlayer,
    handleNextPhase,
    timeRemaining,
    isCountdownActive,
    discussionTimeRemaining
  } = useGameState();

  // 处理游戏开始
  const handleStartGame = (playerName, selectedRole) => {
    startGame(playerName, selectedRole);
  };

  return (
    <div className="App">
      {gamePhase === 'lobby' ? (
        <>
          <h1 className="app-title">
            <i className="fas fa-moon"></i> 狼人杀 - 9人局
          </h1>
          <GameLobby onStartGame={handleStartGame} />
        </>
      ) : (
        <div className="game-container">
          <header className="game-header">
            <h1>
              {gamePhase === 'night' && <i className="fas fa-moon"></i>}
              {gamePhase === 'day' && <i className="fas fa-sun"></i>}
              {gamePhase === 'voting' && <i className="fas fa-vote-yea"></i>}
              {gamePhase === 'gameOver' && <i className="fas fa-trophy"></i>}
              {' '}
              狼人杀 - 第{currentDay}天
            </h1>
            <div className="game-phase">
              {gamePhase === 'night' && "夜晚阶段"}
              {gamePhase === 'day' && "白天讨论阶段"}
              {gamePhase === 'voting' && "投票阶段"}
              {gamePhase === 'gameOver' && "游戏结束"}
            </div>
          </header>

          <div className="game-main">
            <div className="game-sidebar">
              <PlayerList
                players={players}
                currentTurn={currentTurn}
                currentRole={currentRole}
                gamePhase={gamePhase}
                selectedPlayer={gamePhase === 'voting' ? votedPlayer : targetPlayer}
                onPlayerSelect={gamePhase === 'voting' ? setVotedPlayer : setTargetPlayer}
                isSelectionEnabled={
                  (gamePhase === 'night' && ['werewolf', 'seer', 'witch'].includes(currentRole)) || 
                  (gamePhase === 'voting' && !hasHumanVoted)
                }
              />
              <GameLog logs={logs} currentDay={currentDay} />
            </div>

            <div className="game-content">
              {gamePhase === 'night' && (
                <NightActions
                  currentRole={currentRole}
                  players={players}
                  targetPlayer={targetPlayer}
                  setTargetPlayer={setTargetPlayer}
                  handleSeerCheck={handleSeerCheck}
                  handleWitchSave={handleWitchSave}
                  handleWitchPoison={handleWitchPoison}
                  skipWitchAction={skipWitchAction}
                  handleWolfKill={handleWolfKill}
                  isSaved={isSaved}
                  canSave={canSave}
                  canPoison={canPoison}
                  poisonTarget={poisonTarget}
                  setPoisonTarget={setPoisonTarget}
                  handleNightEnd={handleNightEnd}
                  nightVictim={nightVictim}
                />
              )}

              {gamePhase === 'day' && (
                <div className="day-discussion">
                  <h2>
                    <i className="fas fa-comments"></i> 白天讨论
                  </h2>
                  
                  {isCountdownActive && (
                    <div className="discussion-timer">
                      <i className="fas fa-hourglass-half"></i>
                      剩余时间: {Math.floor(discussionTimeRemaining / 60)}:{(discussionTimeRemaining % 60).toString().padStart(2, '0')}
                    </div>
                  )}

                  <div className="human-discussion">
                    <p><strong>你的发言:</strong></p>
                    <div className="chat-input">
                      <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder="输入你的发言..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && currentMessage.trim()) {
                            sendMessage();
                          }
                        }}
                      />
                      <button onClick={sendMessage} disabled={!currentMessage.trim()}>
                        <i className="fas fa-paper-plane"></i> 发送
                      </button>
                    </div>
                  </div>

                  <button className="next-phase-button" onClick={handleDayDiscussion}>
                    <i className="fas fa-arrow-right"></i> 进入投票阶段
                  </button>
                </div>
              )}

              {gamePhase === 'voting' && (
                <Voting
                  players={activePlayers}
                  votedPlayer={votedPlayer}
                  setVotedPlayer={setVotedPlayer}
                  finishVoting={finishVoting}
                  hasHumanVoted={hasHumanVoted}
                  eliminatedPlayer={eliminatedPlayer}
                  handleNextPhase={handleNextPhase}
                  timeRemaining={timeRemaining}
                />
              )}

              {gamePhase === 'gameOver' && (
                <GameOver
                  winner={gameWinner}
                  players={players}
                  restartGame={restartGame}
                  logs={logs}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
