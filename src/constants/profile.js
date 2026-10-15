/**
 * Cozy Typist Profile Presets and Defaults
 */

export const DEFAULT_PROFILE = {
  name: 'Typist',
  avatar: 'cat',
  avatarType: 'preset', // 'preset' | 'custom'
};

export const AVATAR_PRESETS = [
  { id: 'cat', emoji: '🐱', label: 'Mochi Cat' },
  { id: 'dog', emoji: '🐶', label: 'Shiba' },
  { id: 'bunny', emoji: '🐰', label: 'Cozy Bunny' },
  { id: 'fox', emoji: '🦊', label: 'Forest Fox' },
  { id: 'bear', emoji: '🐻', label: 'Warm Bear' },
  { id: 'panda', emoji: '🐼', label: 'Chill Panda' },
  { id: 'boba', emoji: '🧋', label: 'Boba Tea' },
  { id: 'coffee', emoji: '☕', label: 'Warm Latte' },
  { id: 'sprout', emoji: '🌱', label: 'Tiny Sprout' },
  { id: 'sakura', emoji: '🌸', label: 'Sakura' },
  { id: 'star', emoji: '⭐', label: 'Gentle Star' },
  { id: 'duck', emoji: '🦆', label: 'Quiet Duck' },
];

export function getPresetAvatar(id) {
  return AVATAR_PRESETS.find(p => p.id === id) || AVATAR_PRESETS[0];
}
