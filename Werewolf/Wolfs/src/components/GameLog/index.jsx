import React, { useEffect, useRef, memo } from 'react';
import './styles.css';

const GameLog = memo(({ logs, currentDay }) => {
  const logContainerRef = useRef(null);

  // 当日志更新时，自动滚动到底部
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // 为每一天的日志添加日期标题
  const groupedLogs = logs.reduce((acc, log) => {
    const day = log.day;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(log);
    return acc;
  }, {});

  return (
    <div className="game-log">
      <h3>
        <i className="fas fa-scroll"></i> 游戏日志
      </h3>
      <div className="log-container" ref={logContainerRef}>
        {Object.keys(groupedLogs).map(day => (
          <div key={day} className="day-logs">
            <div className="day-header">第 {day} 天</div>
            {groupedLogs[day].map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

export default GameLog; 