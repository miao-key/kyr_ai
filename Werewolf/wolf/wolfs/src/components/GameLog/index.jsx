import { useEffect, useRef } from 'react'

const GameLog = ({ gameLog, isVisible = true }) => {
  const logEndRef = useRef(null)

  useEffect(() => {
    // 自动滚动到最新日志
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [gameLog])

  if (!isVisible) return null

  return (
    <div className="game-log">
      <div className="log-header">
        <h3>📜 游戏日志</h3>
      </div>
      
      <div className="log-content">
        {gameLog.length === 0 ? (
          <div className="empty-log">
            <p>暂无游戏记录</p>
          </div>
        ) : (
          <div className="log-entries">
            {gameLog.map((entry, index) => (
              <div key={index} className="log-entry">
                <span className="log-time">{entry.timestamp}</span>
                <span className="log-message">{entry.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}

export default GameLog