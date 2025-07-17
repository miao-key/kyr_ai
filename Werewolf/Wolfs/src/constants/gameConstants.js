// 游戏角色类型
export const ROLE_TYPES = {
  VILLAGER: 'villager', // 村民
  WEREWOLF: 'werewolf', // 狼人
  SEER: 'seer',         // 预言家
  WITCH: 'witch',       // 女巫
  HUNTER: 'hunter',     // 猎人
};

// 游戏阶段
export const GAME_PHASES = {
  LOBBY: 'lobby',           // 游戏大厅
  NIGHT: 'night',           // 夜晚
  DAY_DISCUSSION: 'day_discussion', // 白天讨论
  DAY_VOTE: 'day_vote',     // 白天投票
  GAME_OVER: 'game_over',   // 游戏结束
};

// 夜晚行动顺序
export const NIGHT_ACTION_ORDER = [
  ROLE_TYPES.SEER,    // 预言家先行动
  ROLE_TYPES.WEREWOLF, // 狼人团队
  ROLE_TYPES.WITCH,    // 女巫最后行动
];

// 女巫技能
export const WITCH_POWERS = {
  SAVE: 'save',   // 解药
  POISON: 'poison', // 毒药
};

// 玩家状态
export const PLAYER_STATUS = {
  ALIVE: 'alive',     // 存活
  DEAD: 'dead',       // 死亡
};

// 游戏结果
export const GAME_RESULTS = {
  VILLAGER_WIN: 'villager_win',   // 村民获胜
  WEREWOLF_WIN: 'werewolf_win',   // 狼人获胜
};

// 9人标准局配置
export const GAME_CONFIG = {
  TOTAL_PLAYERS: 9,
  ROLE_DISTRIBUTION: {
    [ROLE_TYPES.WEREWOLF]: 3,  // 3个狼人
    [ROLE_TYPES.VILLAGER]: 3,  // 3个村民
    [ROLE_TYPES.SEER]: 1,      // 1个预言家
    [ROLE_TYPES.WITCH]: 1,     // 1个女巫
    [ROLE_TYPES.HUNTER]: 1,    // 1个猎人
  },
}; 