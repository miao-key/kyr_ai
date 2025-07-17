import { 
  ROLE_TYPES, 
  GAME_CONFIG, 
  PLAYER_STATUS 
} from '../constants/gameConstants';

// 生成唯一ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// 打乱数组
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 生成AI玩家名称
const AI_NAMES = [
  '小红', '小明', '小刚', '小李', 
  '小张', '小王', '小赵', '小钱', 
  '小孙', '小周', '小吴', '小郑'
];

// 生成AI玩家和分配角色
export const generateAIPlayers = (humanPlayerName = '玩家', humanPlayerRole = null) => {
  // 生成角色列表
  const allRoles = [];
  
  // 根据配置添加不同角色
  Object.entries(GAME_CONFIG.ROLE_DISTRIBUTION).forEach(([role, count]) => {
    for (let i = 0; i < count; i++) {
      allRoles.push(role);
    }
  });
  
  // 打乱角色顺序
  const shuffledRoles = shuffleArray(allRoles);
  
  // 为人类玩家分配角色
  const humanPlayerIndex = humanPlayerRole ? 
    shuffledRoles.findIndex(role => role === humanPlayerRole) : 
    Math.floor(Math.random() * shuffledRoles.length);
  
  const humanPlayerData = {
    id: generateId(),
    name: humanPlayerName,
    role: shuffledRoles[humanPlayerIndex],
    isHuman: true,
    status: PLAYER_STATUS.ALIVE,
    // 根据角色添加特殊属性
    ...(shuffledRoles[humanPlayerIndex] === ROLE_TYPES.WITCH ? 
      { usedSave: false, usedPoison: false } : {})
  };
  
  // 去除人类玩家的角色
  shuffledRoles.splice(humanPlayerIndex, 1);
  
  // 为AI玩家分配角色和名字
  const shuffledNames = shuffleArray(AI_NAMES).slice(0, GAME_CONFIG.TOTAL_PLAYERS - 1);
  
  const aiPlayers = shuffledRoles.map((role, index) => ({
    id: generateId(),
    name: shuffledNames[index],
    role,
    isHuman: false,
    status: PLAYER_STATUS.ALIVE,
    // 根据角色添加特殊属性
    ...(role === ROLE_TYPES.WITCH ? { usedSave: false, usedPoison: false } : {})
  }));
  
  // 合并人类玩家和AI玩家
  const allPlayers = [humanPlayerData, ...aiPlayers];
  
  return {
    allPlayers,
    humanPlayerData
  };
};

// 获取角色中文名称
export const getRoleDisplayName = (role) => {
  switch (role) {
    case ROLE_TYPES.WEREWOLF:
      return '狼人';
    case ROLE_TYPES.VILLAGER:
      return '村民';
    case ROLE_TYPES.SEER:
      return '预言家';
    case ROLE_TYPES.WITCH:
      return '女巫';
    case ROLE_TYPES.HUNTER:
      return '猎人';
    default:
      return '未知';
  }
};

// 获取玩家身份描述
export const getPlayerRoleDescription = (role) => {
  switch (role) {
    case ROLE_TYPES.WEREWOLF:
      return '每晚可以杀死一名玩家，目标是消灭所有好人';
    case ROLE_TYPES.VILLAGER:
      return '没有特殊技能，需要通过推理找出狼人';
    case ROLE_TYPES.SEER:
      return '每晚可以查验一名玩家的身份是否为狼人';
    case ROLE_TYPES.WITCH:
      return '拥有一瓶解药和一瓶毒药，可以救人或毒人';
    case ROLE_TYPES.HUNTER:
      return '被杀时可以开枪带走一名玩家';
    default:
      return '未知角色';
  }
}; 