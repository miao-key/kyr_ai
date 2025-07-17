import { GAME_RESULTS, ROLE_TYPES } from '../../constants/gameConstants';
import { getRoleDisplayName } from '../../utils/gameUtils';
import './styles.css';

const GameOver = ({ gameResult, players, humanPlayer, onPlayAgain }) => {
  // 计算狼人团队
  const werewolfTeam = players.filter(player => player.role === ROLE_TYPES.WEREWOLF);
  
  // 计算村民团队
  const villagerTeam = players.filter(player => player.role !== ROLE_TYPES.WEREWOLF);
  
  // 判断人类玩家是否获胜
  const isHumanWinner = () => {
    if (!humanPlayer) return false;
    
    if (humanPlayer.role === ROLE_TYPES.WEREWOLF) {
      return gameResult === GAME_RESULTS.WEREWOLF_WIN;
    } else {
      return gameResult === GAME_RESULTS.VILLAGER_WIN;
    }
  };
  
  return (
    <div className="game-over-container">
      <div className={`result-banner ${gameResult === GAME_RESULTS.VILLAGER_WIN ? 'villager-win' : 'werewolf-win'}`}>
        <h1 className="result-title">
          {gameResult === GAME_RESULTS.VILLAGER_WIN ? '好人阵营获胜！' : '狼人阵营获胜！'}
        </h1>
        
        <div className="player-result">
          {isHumanWinner() ? (
            <h2 className="player-victory">恭喜，您获胜了！</h2>
          ) : (
            <h2 className="player-defeat">很遗憾，您失败了！</h2>
          )}
        </div>
      </div>
      
      <div className="teams-container">
        <div className="team werewolf-team">
          <h3>狼人阵营</h3>
          <ul>
            {werewolfTeam.map(wolf => (
              <li key={wolf.id} className={wolf.isHuman ? 'human-player' : ''}>
                {wolf.name} {wolf.isHuman && '(你)'}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="team villager-team">
          <h3>好人阵营</h3>
          <ul>
            {villagerTeam.map(villager => (
              <li key={villager.id} className={villager.isHuman ? 'human-player' : ''}>
                {villager.name} - {getRoleDisplayName(villager.role)} {villager.isHuman && '(你)'}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="game-summary">
        <h3>游戏总结</h3>
        <p>
          {gameResult === GAME_RESULTS.VILLAGER_WIN 
            ? '好人找出了所有的狼人，村庄恢复了和平！' 
            : '狼人成功蒙蔽了村民，占领了整个村庄！'}
        </p>
      </div>
      
      <button 
        className="play-again-button"
        onClick={onPlayAgain}
      >
        再玩一次
      </button>
    </div>
  );
};

export default GameOver; 