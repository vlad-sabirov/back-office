export const IconCrmBatteryPropsLevels = ['empty', 'low', 'medium', 'full'] as const;

export interface IconCrmBatteryProps {
	level: typeof IconCrmBatteryPropsLevels[number];
	className?: string;
	onClick?: () => void;
}
