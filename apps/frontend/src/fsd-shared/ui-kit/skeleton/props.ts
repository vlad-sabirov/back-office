export const ISkeletonPropsRounded = ['none', 'small', 'medium', 'large', 'circle'] as const;

export interface SkeletonProps {
	width?: number | string;
	height?: number | string;
	rounded?: typeof ISkeletonPropsRounded[number];
	animate?: boolean;
	className?: string;
}
