import { useStateSelector } from '@fsd/shared/lib/hooks';

export const CheckAccessJSX = ({
	accessRoles,
	content,
}: {
	accessRoles: string[];
	content: JSX.Element;
}): JSX.Element => {
	const roles = useStateSelector((state) => state.app.auth.roles);
	accessRoles.push('admin');

	if (roles?.some((element) => accessRoles.includes(element))) return content;
	return <></>;
};

export const CheckAccessBoolean = (accessRoles: string[], userRoles: string[]) => {
	if (typeof accessRoles === 'undefined') return false;
	accessRoles.push('admin');
	return userRoles && userRoles.some((element) => accessRoles.includes(element));
};
