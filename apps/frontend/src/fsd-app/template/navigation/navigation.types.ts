import { IconPropsNames } from '@fsd/shared/ui-kit';

export interface INavigationData {
	title: string;
	access: string[];
	alias: string;
	route?: string;
	icon?: (typeof IconPropsNames)[number];
	children?: INavigationData[];
	isDisabled?: boolean;
	isHide?: boolean;
	isModal?: boolean;
	modalComponent?: string;
}
