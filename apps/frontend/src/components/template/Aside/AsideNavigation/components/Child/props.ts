export interface ChildPropsData {
	title: string;
	route?: string;
	isModal?: boolean;
	modalComponent?: string;
	isHide?: boolean;
	isDisabled?: boolean;
	isActive?: boolean;
	access: string[];
}

export interface ChildProps {
	data: ChildPropsData;
}
