import React from 'react';
import type { SkinDef } from '../store/gameState';

interface CharacterAvatarPreviewProps {
  skin: SkinDef;
  size?: number;
  isEquipped?: boolean;
}

export const CharacterAvatarPreview: React.FC<CharacterAvatarPreviewProps> = ({
  skin,
  size = 110,
  isEquipped = false,
}) => {
  const headHex = '#' + skin.headColor.toString(16).padStart(6, '0');
  const bodyTopHex = '#' + skin.bodyTopColor.toString(16).padStart(6, '0');
  const bodyBottomHex = '#' + skin.bodyBottomColor.toString(16).padStart(6, '0');
  const shoesHex = '#' + skin.shoesColor.toString(16).padStart(6, '0');
  const accentHex = '#' + skin.accentColor.toString(16).padStart(6, '0');
  const hatHex = skin.hatColor ? '#' + skin.hatColor.toString(16).padStart(6, '0') : '#222222';

  const headY = skin.hatType !== 'none' ? 36 : 28;

  return (
    <div
      style={{ width: size, height: size * 1.15 }}
      className={`relative flex items-center justify-center bg-[#F4F1E8] rounded-md border-2 ${
        isEquipped ? 'border-[#315B43] ring-2 ring-[#315B43]/30' : 'border-[#D5D4CD]'
      } p-1.5 shadow-inner transition-transform hover:scale-[1.02]`}
    >
      <svg viewBox="0 0 64 80" className="w-full h-full drop-shadow">
        {/* Headwear / Hat */}
        {skin.hatType === 'cap' && (
          <g>
            <ellipse cx="32" cy={headY - 14} rx="22" ry="7" fill={hatHex} />
            <rect x="14" y={headY - 24} width="36" height="15" rx="5" fill={hatHex} />
            <rect x="14" y={headY - 12} width="36" height="4" fill={accentHex} />
          </g>
        )}
        {skin.hatType === 'traditional' && (
          <g>
            <ellipse cx="32" cy={headY - 16} rx="26" ry="11" fill={hatHex} />
            <ellipse cx="32" cy={headY - 22} rx="18" ry="10" fill={hatHex} />
            <ellipse cx="32" cy={headY - 16} rx="20" ry="4" fill={accentHex} opacity="0.85" />
          </g>
        )}

        {/* Head */}
        <circle cx="32" cy={headY} r="15" fill={headHex} />
        {/* Eyes */}
        <circle cx="27" cy={headY - 2} r="2.5" fill="#1A1A1A" />
        <circle cx="37" cy={headY - 2} r="2.5" fill="#1A1A1A" />
        {/* Friendly smile */}
        <path
          d={`M 28 ${headY + 6} Q 32 ${headY + 9} 36 ${headY + 6}`}
          stroke="#1A1A1A"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Shirt / Jacket */}
        <rect x="14" y={headY + 14} width="36" height="24" rx="4" fill={bodyTopHex} />

        {/* Collar & Tie / Accent */}
        <polygon points={`32,${headY + 14} 27,${headY + 22} 37,${headY + 22}`} fill={accentHex} />
        <rect x="30" y={headY + 22} width="4" height="12" fill={accentHex} />

        {/* Trousers */}
        <rect x="16" y={headY + 38} width="14" height="20" fill={bodyBottomHex} />
        <rect x="34" y={headY + 38} width="14" height="20" fill={bodyBottomHex} />

        {/* Shoes */}
        <rect x="13" y={headY + 56} width="17" height="8" rx="3" fill={shoesHex} />
        <rect x="34" y={headY + 56} width="17" height="8" rx="3" fill={shoesHex} />
      </svg>
    </div>
  );
};
