import { FC, createContext, useContext } from 'react';
import { Auth, Users } from './modals';
import AdminStore from './store';
import { observer } from 'mobx-react-lite';
import { getCookie } from 'react-use-cookie';
import { useHotkeys } from '@mantine/hooks';

const Store = new AdminStore();
export const AdminContext = createContext(Store);

const AuthSpotlight: FC = observer(() => {
	const Store = useContext(AdminContext);
	const isAdmin = Store.isAuth || getCookie('isAdmin') === 'true';

	useHotkeys([
		[
			'alt + mod + ctrl + U',
			() => {
				const modalName: keyof typeof Store.modals = 'authUsers';
				if (isAdmin) Store.modalOpen(modalName, true);
				if (isAdmin) return;
				Store.setOpenedModalAfterAuth(modalName);
				Store.modalOpen('authAdmin', true);
			},
		],
	]);

	return (
		<>
			<Auth />
			<Users />
		</>
	);
});

const withHOC = <T extends Record<string, unknown>>(Component: FC<T>) => {
	return function withHOC(props: T): JSX.Element {
		return (
			<AdminContext.Provider value={Store}>
				<Component {...props} />
			</AdminContext.Provider>
		);
	};
};

export default withHOC(AuthSpotlight);
