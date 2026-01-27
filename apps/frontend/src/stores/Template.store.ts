import { RefObject } from 'react';
import { makeAutoObservable } from 'mobx';
import { ParentPropsData } from '@components/template/Aside/AsideNavigation';

export default class TemplateStore {
	constructor() {
		makeAutoObservable(this);
	}

	navigation: ParentPropsData[] = [] as ParentPropsData[];
	setNavigation(value: ParentPropsData[]): void {
		this.navigation = value;
	}

	bodyRef: RefObject<HTMLDivElement> | null = null;
	setBodyRef(ref: RefObject<HTMLDivElement> | null): void {
		this.bodyRef = ref;
	}

	toggleNavigationCollapsed(alias: string): void {
		this.setNavigation(
			this.navigation.map((firstLevel) => {
				if (firstLevel.alias === alias && !firstLevel.isActive && !firstLevel.isDisabled) {
					firstLevel.isCollapsed = !firstLevel.isCollapsed;
				}
				return firstLevel;
			})
		);
	}
}
