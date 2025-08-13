// Centralized animation constants to avoid magic numbers

export const TITLE_ANIMATION = {
	// Delay before the title collapse starts (ms)
	DELAY_MS: 2400,
	// Container width collapse duration (s)
	WIDTH_DURATION_S: 1.7,
	// Crossfade/transform duration for text (s)
	FADE_DURATION_S: 1.2,
	// Easing
	WIDTH_EASE: [0.22, 1, 0.36, 1] as [number, number, number, number],
	FADE_EASE: 'easeOut' as const,
	// Small translation and scale values for subtle motion
	SHIFT_PX: 8,
	SMALL_Y_OFFSET_PX: 2,
	SMALL_NEAR_SCALE: 0.98,
} as const;


