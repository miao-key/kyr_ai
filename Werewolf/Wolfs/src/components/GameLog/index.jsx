import { useRef, useEffect } from 'react';
import './styles.css';

const GameLog = ({ logs, day }) => {
  const logContainerRef = useRef(null);
  
  // 自动滚动到最新日志
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);
  
  return (
    <div className="game-log-container">
      <h3>游戏日志 - 第{day}天</h3>
      
      <div className="game-logs" ref={logContainerRef}>
        {logs.length === 0 ? (
          <div className="no-logs">游戏尚未开始</div>
        ) : (
          logs.map((log, index) => (
            <div 
              key={index} 
              className={`log-item ${log.day === day ? 'current-day' : ''}`}
            >
              <span className="log-day">第{log.day}天:</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GameLog; 