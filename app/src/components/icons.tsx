import Svg, { Path, Circle, Polyline, Line, Rect } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const base = (size = 24) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
});

export function ChevronLeftIcon({ size = 24, color = '#F5F3F7', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SearchIcon({ size = 24, color = '#F5F3F7', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function HomeIcon({ size = 24, color = '#F5F3F7', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M3 11.5 12 4l9 7.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function LibraryIcon({ size = 24, color = '#F5F3F7', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M9 3v18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function ProfileIcon({ size = 24, color = '#F5F3F7', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PlayIcon({ size = 24, color = '#14121F' }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M7 4.5v15l13-7.5-13-7.5Z" fill={color} />
    </Svg>
  );
}

export function PauseIcon({ size = 24, color = '#14121F' }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Rect x="6" y="4.5" width="4.5" height="15" rx="1" fill={color} />
      <Rect x="13.5" y="4.5" width="4.5" height="15" rx="1" fill={color} />
    </Svg>
  );
}

export function SkipBackIcon({ size = 24, color = '#F5F3F7' }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M18 5v14L7 12l11-7Z" fill={color} />
      <Rect x="5" y="5" width="2" height="14" rx="1" fill={color} />
    </Svg>
  );
}

export function SkipForwardIcon({ size = 24, color = '#F5F3F7' }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M6 5v14l11-7L6 5Z" fill={color} />
      <Rect x="17" y="5" width="2" height="14" rx="1" fill={color} />
    </Svg>
  );
}

export function HeartIcon({ size = 24, color = '#F5F3F7', filled = false, strokeWidth = 2 }: IconProps & { filled?: boolean }) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M12 20.5s-7.5-4.6-9.8-9.1C.8 8.2 2.3 5 5.6 4.4c2-.4 3.7.5 4.9 2.1a5.6 5.6 0 0 1 1.5-1.8c1.4-1.1 3.4-1.4 5-.5 2.6 1.4 3.3 4.6 1.8 7.3C16.8 15.6 12 20.5 12 20.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
}

export function ThumbsDownIcon({ size = 24, color = '#9A94AA', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M7 14V4M3 12.5V4a1 1 0 0 1 1-1h10.5a2 2 0 0 1 1.94 1.52l1.5 6A2 2 0 0 1 15 13h-3.5v3.8a1.7 1.7 0 0 1-3.05 1.02L7 14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PlusIcon({ size = 24, color = '#14121F', strokeWidth = 2.5 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}
