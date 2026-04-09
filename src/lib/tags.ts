export const TAG_DEFINITIONS = [
  { key: 'game',      label: '游戏', emoji: '🎮' },
  { key: 'tool',      label: '工具', emoji: '🛠️' },
  { key: 'visual',    label: '视觉', emoji: '🎨' },
  { key: 'creative',  label: '创意', emoji: '🎭' },
  { key: 'design',    label: '设计', emoji: '🏪' },
  { key: 'algorithm', label: '算法', emoji: '🧪' },
  { key: 'chat',      label: '对话', emoji: '💬' },
  { key: 'dataviz',   label: '数据', emoji: '📊' },
  { key: 'physics',   label: '物理', emoji: '⚛️' },
  { key: 'fix',       label: '修复', emoji: '🔧' },
  { key: 'enhance',   label: '增强', emoji: '✨' },
] as const;

export type TagKey = typeof TAG_DEFINITIONS[number]['key'];
