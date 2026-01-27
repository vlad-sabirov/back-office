import { IconPropsNames } from '@fsd/shared/ui-kit';
import { ChildPropsData } from '..';

export interface ParentPropsData {
	alias: string;
	route: string;
	title: string;
	icon: typeof IconPropsNames[number];
	children?: ChildPropsData[];
	isHide?: boolean;
	isDisabled?: boolean;
	isActive?: boolean;
	isCollapsed?: boolean;
	access: string[];
}

export interface ParentProps {
	data: ParentPropsData;
}
