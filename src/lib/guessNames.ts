const ADJECTIVES = [
  "敏锐",
  "神秘",
  "果敢",
  "冷静",
  "睿智",
  "好奇",
  "机灵",
  "沉着",
  "锐利",
  "灵巧",
  "无畏",
  "闪电",
  "暗影",
  "极速",
  "深邃",
  "璀璨",
];

const NOUNS = [
  "鉴模师",
  "观察者",
  "侦探",
  "玩家",
  "猎手",
  "行者",
  "守望者",
  "解码者",
  "评审",
  "探员",
  "向导",
  "学徒",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a friendly random nickname like "敏锐鉴模师_8f3a".
 * Caller should retry on unique-constraint collision.
 */
export function randomNickname(): string {
  const suffix = Math.random().toString(16).slice(2, 6);
  return `${randomItem(ADJECTIVES)}${randomItem(NOUNS)}_${suffix}`;
}
