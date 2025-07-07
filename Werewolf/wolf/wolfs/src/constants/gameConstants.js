// 游戏角色配置 - 9人标准局
export const ROLES = {
  WEREWOLF: { name: '狼人', count: 3, team: 'werewolf', description: '夜晚可以杀死一名玩家' },
  VILLAGER: { name: '村民', count: 3, team: 'villager', description: '白天投票找出狼人' },
  SEER: { name: '预言家', count: 1, team: 'villager', description: '夜晚可以查验一名玩家身份' },
  WITCH: { name: '女巫', count: 1, team: 'villager', description: '拥有解药和毒药各一瓶' },
  HUNTER: { name: '猎人', count: 1, team: 'villager', description: '被投票出局时可以开枪带走一名玩家' }
}

export const GAME_PHASES = {
  LOBBY: 'lobby',
  NIGHT: 'night',
  DAY: 'day',
  VOTING: 'voting',
  GAME_OVER: 'game_over'
}

export const AI_PERSONALITIES = [
  { type: '谨慎型', traits: '说话谨慎，逻辑清晰，不轻易相信他人' },
  { type: '激进型', traits: '发言激烈，容易怀疑他人，喜欢主导讨论' },
  { type: '分析型', traits: '善于分析，逻辑推理能力强，发言有条理' },
  { type: '跟风型', traits: '容易被他人影响，发言较少，倾向于跟随多数' },
  { type: '沉默型', traits: '话不多，但关键时刻会发表重要观点' }
]

export const PLAYER_NAMES = ['你', 'AI玩家1', 'AI玩家2', 'AI玩家3', 'AI玩家4', 'AI玩家5', 'AI玩家6', 'AI玩家7', 'AI玩家8']