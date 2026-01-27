import { Icon, Menu, NextLink } from '@fsd/shared/ui-kit';
import { MenuItemStaffUserProps } from './props';
import { MenuItemStaffCall } from '../MenuItemStaffCall';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const MenuItemStaffUser = ({ data, content, isCall }: MenuItemStaffUserProps): JSX.Element => {
	const userId = useStateSelector((state) => state.app.auth.userId);

	return (
		<>
			<Menu.Label>
				{data.lastName} {data.firstName}
			</Menu.Label>
			{data.surName ? <Menu.Label style={{ margin: 0, padding: '0px 10px' }}>{data.surName}</Menu.Label> : null}
			<Menu.Label size="small">{data.workPosition}</Menu.Label>

			<Menu.Divider />

			{!!content && (
				<>
					{content}
					<Menu.Divider />
				</>
			)}

			<Menu.Item icon={<Icon name="user" />} component={NextLink} href={'/staff/list/cabinet/' + data.id}>
				Профиль
			</Menu.Item>

			{userId != data.id ? (
				isCall ? (
					<>
						<Menu.Divider />
						<Menu.Label size={'small'}>
							Нельзя позвонить.
							<br />
							Разговаривает по телефону.
						</Menu.Label>
					</>
				) : (
					<>
						<Menu.Divider />
						<MenuItemStaffCall mode="voip" phone={data.phoneVoip ? Number(data.phoneVoip) : undefined} />
						<MenuItemStaffCall
							mode="mobile"
							phone={data.phoneVoip ? Number(data.phoneMobile) : undefined}
						/>
					</>
				)
			) : null}
		</>
	);
};
