import { useContext, useEffect } from 'react';
import { data } from './data';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { useAccess } from '@hooks';
import { Parent } from '.';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { MainContext } from '@globalStore';

export const AsideNavigation = observer((): JSX.Element => {
	const { templateStore } = useContext(MainContext);
	const { asPath: route } = useRouter();
	const auth = useStateSelector((state) => state.app.auth);
	const CheckAccess = useAccess();

	useEffect(() => {
		if (!auth.username) { return; }
		const newNavigation = data.map((firstLevel) => {
			if (firstLevel.route !== '/') {
				firstLevel.isActive = route.includes(firstLevel.route);
				firstLevel.isCollapsed = route.includes(firstLevel.route);
			} else {
				firstLevel.isActive = route === firstLevel.route;
				firstLevel.isCollapsed = false;
			}

			if (!CheckAccess(firstLevel.access)) firstLevel.isHide = true;
			
			if (firstLevel.children?.length)
				firstLevel.children.map((secondLevel) => {
					if (secondLevel.route) secondLevel.isActive = route.includes(secondLevel.route);
					if (!CheckAccess(secondLevel.access)) secondLevel.isHide = true;
				});
				
				return firstLevel;
			});
			
		templateStore.setNavigation(newNavigation);
	}, [route, auth, CheckAccess, templateStore]);
	

	return (
		<ul>
			{templateStore.navigation.map((element, index) => (
				<Parent data={element} key={index} />
			))}
		</ul>
	);
});
