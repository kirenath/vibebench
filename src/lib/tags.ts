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
  { key: 'reality',   label: '复刻', emoji: '🌐' },
] as const;

export type TagKey = typeof TAG_DEFINITIONS[number]['key'];

export const DIFFICULTY_DEFINITIONS = [
  { key: 'easy',   label: '入门', colorClass: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-400' },
  { key: 'medium', label: '进阶', colorClass: 'bg-amber-500/15 text-amber-700 ring-amber-500/30 dark:text-amber-400' },
  { key: 'hard',   label: '挑战', colorClass: 'bg-red-500/15 text-red-700 ring-red-500/30 dark:text-red-400' },
] as const;

export type DifficultyKey = typeof DIFFICULTY_DEFINITIONS[number]['key'];
