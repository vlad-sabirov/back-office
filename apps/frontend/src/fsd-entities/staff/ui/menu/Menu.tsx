import { Icon, Menu as MenuUI, NextLink } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { IMenuStaffProps } from './menu.props';

export const Menu = ({ user, content, children, className }: IMenuStaffProps): JSX.Element => {
	const { user: me } = useUserDeprecated();

	return (
		<MenuUI control={children} className={className}>
			<MenuUI.Label>
				{user.lastName} {user.firstName}
			</MenuUI.Label>
			<MenuUI.Label size="small">{user.workPosition}</MenuUI.Label>

			<MenuUI.Divider />
			{!!content && (
				<>
					{' '}
					{content} <MenuUI.Divider />{' '}
				</>
			)}

			<MenuUI.Item component={NextLink} icon={<Icon name="user" />} href={'/staff/list/cabinet/' + user.id}>
				{' '}
				Профиль{' '}
			</MenuUI.Item>

			{me?.id != user.id ? (
				<>
					<MenuUI.Divider />

					{user.phoneVoip && (
						<MenuUI.Item icon={<Icon name="call-phone" color="orange" />}> Внутренний </MenuUI.Item>
					)}

					{user.phoneMobile && (
						<MenuUI.Item icon={<Icon name="call-phone" color="orange" />}> Мобильный </MenuUI.Item>
					)}
				</>
			) : null}
		</MenuUI>
	);
};
