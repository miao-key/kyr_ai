import { useState, useEffect } from 'react';
import { GAME_PHASES } from './constants/gameConstants';
import useGameState from './hooks/useGameState';
import useNightActions from './hooks/useNightActions';
import useAI from './hooks/useAI';

import GameLobby from './components/GameLobby';
import PlayerList from './components/PlayerList';
import GameLog from './components/GameLog';
import NightActions from './components/NightActions';
import Voting from './components/Voting';
import GameOver from './components/GameOver';

import './App.css';

function App() {
  // 游戏状态管理
  const {
    gamePhase,
    day,
    players,
    humanPlayer,
    gameLogs,
    gameResult,
    killedAtNight,
    witchPowers,
    initializeGame,
    nextPhase,
    updatePlayerStatus,
    wolfKill,
    witchAction,
    seerCheck,
    dayVote,
    addGameLog
  } = useGameState();
  
  // 夜晚行动管理
  const {
    currentActionRole,
    seerCheckResult,
    witchSaveUsed,
    witchPoisonUsed,
    startNight,
    handleWolfKill,
    handleSeerCheck,
    handleWitchAction,
    skipCurrentAction,
    canHumanPlayerAct,
    canWitchUseSavePotion,
    canWitchUsePoisonPotion
  } = useNightActions(
    players,
    humanPlayer,
    gamePhase,
    wolfKill,
    seerCheck,
    witchAction,
    nextPhase,
    addGameLog,
    witchPowers
  );
  
  // AI决策管理
  const {
    getWolfDecision,
    getSeerDecision,
    getWitchDecision,
    getAIDiscussion,
    getVoteDecision
  } = useAI(players, gamePhase, day, killedAtNight);
  
  // 处理游戏开始
  const handleStartGame = (playerName, selectedRole) => {
    initializeGame(playerName, selectedRole);
  };
  
  // 处理日间投票完成
  const handleVoteComplete = (votes) => {
    // 执行投票逻辑
    dayVote(votes);
    
    // 延迟进入下一阶段
    setTimeout(() => {
      nextPhase();
    }, 3000);
  };
  
  // 处理重新开始游戏
  const handlePlayAgain = () => {
    window.location.reload();
  };
  
  // 白天讨论阶段AI自动讨论
  const [discussionTimerActive, setDiscussionTimerActive] = useState(false);
  const [discussionTime, setDiscussionTime] = useState(30); // 讨论时间30秒
  
  useEffect(() => {
    if (gamePhase === GAME_PHASES.DAY_DISCUSSION && !discussionTimerActive) {
      setDiscussionTimerActive(true);
      setDiscussionTime(30);
    } else if (gamePhase !== GAME_PHASES.DAY_DISCUSSION) {
      setDiscussionTimerActive(false);
    }
  }, [gamePhase]);
  
  // 倒计时
  useEffect(() => {
    let timer;
    if (discussionTimerActive && discussionTime > 0) {
      timer = setTimeout(() => {
        setDiscussionTime(prev => prev - 1);
      }, 1000);
    } else if (discussionTimerActive && discussionTime === 0) {
      nextPhase(); // 讨论时间结束，进入投票阶段
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [discussionTimerActive, discussionTime, nextPhase]);
  
  // AI讨论发言
  useEffect(() => {
    if (gamePhase === GAME_PHASES.DAY_DISCUSSION) {
      // 每隔几秒钟让一个AI随机发言
      const speakInterval = setInterval(() => {
        const aliveAiPlayers = players.filter(p => !p.isHuman && p.status === 'alive');
        if (aliveAiPlayers.length > 0) {
          const randomPlayer = aliveAiPlayers[Math.floor(Math.random() * aliveAiPlayers.length)];
          const discussion = getAIDiscussion(randomPlayer.id);
          if (discussion) {
            addGameLog(`${randomPlayer.name} 说: ${discussion}`);
          }
        }
      }, 5000);
      
      return () => {
        clearInterval(speakInterval);
      };
    }
  }, [gamePhase, players, getAIDiscussion, addGameLog]);
  
  // 监听游戏阶段变化
  useEffect(() => {
    if (gamePhase === GAME_PHASES.NIGHT) {
      startNight();
    }
  }, [gamePhase, startNight]);
  
  // 根据游戏阶段渲染不同的内容
  const renderGameContent = () => {
    switch (gamePhase) {
      case GAME_PHASES.LOBBY:
        return <GameLobby onStartGame={handleStartGame} />;
        
      case GAME_PHASES.GAME_OVER:
        return (
          <GameOver
            gameResult={gameResult}
            players={players}
            humanPlayer={humanPlayer}
            onPlayAgain={handlePlayAgain}
          />
        );
        
      default:
        return (
          <div className="game-container">
            <div className="game-header">
              <h1>狼人杀 - 第{day}天</h1>
              <div className="game-phase">
                {gamePhase === GAME_PHASES.NIGHT && '夜晚阶段'}
                {gamePhase === GAME_PHASES.DAY_DISCUSSION && `白天讨论阶段 (${discussionTime}秒)`}
                {gamePhase === GAME_PHASES.DAY_VOTE && '投票阶段'}
              </div>
            </div>
            
            <div className="game-main">
              <div className="game-sidebar">
                <PlayerList 
                  players={players} 
                  humanPlayer={humanPlayer}
                  gamePhase={gamePhase}
                  canSelect={false}
                />
                
                <GameLog logs={gameLogs} day={day} />
              </div>
              
              <div className="game-content">
                <NightActions
                  gamePhase={gamePhase}
                  players={players}
                  humanPlayer={humanPlayer}
                  currentActionRole={currentActionRole}
                  killedAtNight={killedAtNight}
                  witchSaveUsed={witchSaveUsed}
                  witchPoisonUsed={witchPoisonUsed}
                  onWolfKill={handleWolfKill}
                  onSeerCheck={handleSeerCheck}
                  onWitchAction={handleWitchAction}
                  onSkipAction={skipCurrentAction}
                  seerCheckResult={seerCheckResult}
                  canWitchUseSavePotion={canWitchUseSavePotion}
                  canWitchUsePoisonPotion={canWitchUsePoisonPotion}
                />
                
                {gamePhase === GAME_PHASES.DAY_DISCUSSION && (
                  <div className="day-discussion">
                    <h2>白天讨论阶段</h2>
                    <p>玩家们正在讨论昨晚发生的事情...</p>
                    {humanPlayer && humanPlayer.status === 'alive' && (
                      <div className="human-discussion">
                        <p>你可以在讨论阶段发言:</p>
                        <div className="chat-input">
                          <input 
                            type="text" 
                            id="discussion-input"
                            placeholder="输入你的发言..."
                          />
                          <button 
                            onClick={() => {
                              const input = document.getElementById('discussion-input');
                              if (input && input.value.trim()) {
                                addGameLog(`${humanPlayer.name} 说: ${input.value}`);
                                input.value = '';
                              }
                            }}
                          >
                            发言
                          </button>
                        </div>
                      </div>
                    )}
                    <button 
                      className="next-phase-button"
                      onClick={nextPhase}
                    >
                      结束讨论，开始投票
                    </button>
                  </div>
                )}
                
                <Voting
                  gamePhase={gamePhase}
                  players={players}
                  humanPlayer={humanPlayer}
                  onVote={(targetId) => addGameLog(`${humanPlayer?.name || '玩家'} 投票给了 ${players.find(p => p.id === targetId)?.name || '未知玩家'}`)}
                  onVoteComplete={handleVoteComplete}
                />
              </div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="App">
      {renderGameContent()}
    </div>
  );
}

export default App;
