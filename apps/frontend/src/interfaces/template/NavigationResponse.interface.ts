import { IconPropsNames } from '@fsd/shared/ui-kit';

export interface INavigationResponse {
	id: number;
	route: string;
	title: string;
	icon: typeof IconPropsNames[number];
	position: number;
	topLevel: boolean;
	child: INavigationResponse[];

	createdAt: Date;
	updatedAt: Date;

	isModal: boolean;
	isHide: boolean;
	isActive?: boolean;
	isCollapsed?: boolean;
	isDisabled?: boolean;
}
