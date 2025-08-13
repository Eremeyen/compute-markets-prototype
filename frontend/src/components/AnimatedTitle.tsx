import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { TITLE_ANIMATION } from '../config/animation';

type AnimatedTitleProps = {
	full: string;
	short: string;
	className?: string;
	/** Delay before the collapse animation starts (ms). */
	delayMs?: number;
	/** If true, play the animation once per tab session only. */
	oncePerSession?: boolean;
};

/**
 * AnimatedTitle shows the full title first, then collapses smoothly into the acronym.
 * - Plays once per session when oncePerSession is true
 * - Respects prefers-reduced-motion (skips animation)
 * - Measures widths to avoid layout shift during the collapse
 */
export function AnimatedTitle({
	full,
	short,
	className,
	delayMs = 1200,
	oncePerSession = true,
}: AnimatedTitleProps) {
	const fullRef = useRef<HTMLSpanElement | null>(null);
	const shortRef = useRef<HTMLSpanElement | null>(null);
	const [fullWidth, setFullWidth] = useState<number | null>(null);
	const [shortWidth, setShortWidth] = useState<number | null>(null);
	const [showShortImmediately, setShowShortImmediately] = useState<boolean>(false);
	const [hasPlayed, setHasPlayed] = useState<boolean>(false);
	const [isAnimating, setIsAnimating] = useState<boolean>(false);
	const prefersReducedMotion = useReducedMotion();

	// Measure widths once refs are mounted
	useLayoutEffect(() => {
		const measure = () => {
			const fullEl = fullRef.current;
			const shortEl = shortRef.current;
			if (!fullEl || !shortEl) return;
			// Use scrollWidth to get intrinsic width even if hidden
			const f = Math.ceil(fullEl.scrollWidth);
			const s = Math.ceil(shortEl.scrollWidth);
			setFullWidth(f);
			setShortWidth(s);
		};
		measure();
		// Re-measure on window resize to be safe with responsive fonts
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	}, []);

	// Determine if we should skip animation
	useEffect(() => {
		const sessionKey = 'AnimatedTitlePlayed';
		const alreadyPlayed = oncePerSession && typeof window !== 'undefined'
			? sessionStorage.getItem(sessionKey) === '1'
			: false;
		const shouldSkip = prefersReducedMotion || alreadyPlayed;
		if (shouldSkip) {
			setShowShortImmediately(true);
			setHasPlayed(true);
		}
	}, [oncePerSession, prefersReducedMotion]);

	// Start animation after delay if not skipped
	useEffect(() => {
		if (showShortImmediately) return;
		if (hasPlayed) return;
		if (fullWidth == null || shortWidth == null) return;
		const timer = window.setTimeout(() => {
			setIsAnimating(true);
		}, delayMs);
		return () => window.clearTimeout(timer);
	}, [showShortImmediately, hasPlayed, fullWidth, shortWidth, delayMs]);

	const onAnimationComplete = () => {
		if (isAnimating) {
			setIsAnimating(false);
			setHasPlayed(true);
			if (oncePerSession) {
				try {
					sessionStorage.setItem('AnimatedTitlePlayed', '1');
				} catch {}
			}
		}
	};

	const containerWidth = (() => {
		if (showShortImmediately) return shortWidth ?? 'auto';
		if (hasPlayed && !isAnimating) return shortWidth ?? 'auto';
		return fullWidth ?? 'auto';
	})();

	// Until we have both widths, render invisibly to avoid flicker
	const ready = fullWidth != null && shortWidth != null;

	return (
		<motion.span
			className={className}
			style={{ display: 'inline-block' }}
			initial={false}
			animate={{ width: ready ? containerWidth : undefined }}
			transition={{ duration: TITLE_ANIMATION.WIDTH_DURATION_S, ease: TITLE_ANIMATION.WIDTH_EASE }}
			onAnimationComplete={onAnimationComplete}
		>
			{/* Measuring elements */}
			<span style={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap' }} ref={fullRef}>
				{full}
			</span>
			<span style={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap' }} ref={shortRef}>
				<abbr title={full} style={{ textDecoration: 'none' }}>
					{short}
				</abbr>
			</span>

			{/* Visible stacked content */}
			<span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', visibility: ready ? 'visible' : 'hidden' }}>
				<AnimatePresence initial={false}>
					{showShortImmediately || (hasPlayed && !isAnimating) ? (
						<motion.span
							key="short"
						initial={{ opacity: 0, y: TITLE_ANIMATION.SMALL_Y_OFFSET_PX, scale: TITLE_ANIMATION.SMALL_NEAR_SCALE }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -TITLE_ANIMATION.SMALL_Y_OFFSET_PX, scale: TITLE_ANIMATION.SMALL_NEAR_SCALE }}
						transition={{ duration: TITLE_ANIMATION.FADE_DURATION_S, ease: TITLE_ANIMATION.FADE_EASE }}
							aria-hidden={false}
						>
							<abbr title={full} style={{ textDecoration: 'none' }}>
								{short}
							</abbr>
						</motion.span>
					) : (
						<motion.span
							key="full"
						initial={{ opacity: 1, x: 0 }}
						animate={{ opacity: isAnimating ? 0 : 1, x: isAnimating ? -TITLE_ANIMATION.SHIFT_PX : 0 }}
							exit={{ opacity: 0 }}
						transition={{ duration: TITLE_ANIMATION.FADE_DURATION_S, ease: TITLE_ANIMATION.FADE_EASE }}
							aria-hidden={false}
						>
							{full}
						</motion.span>
					)}
				</AnimatePresence>
			</span>
		</motion.span>
	);
}

export default AnimatedTitle;


