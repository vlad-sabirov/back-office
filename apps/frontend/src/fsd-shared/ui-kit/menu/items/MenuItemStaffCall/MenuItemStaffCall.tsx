import { useCallP2P } from '@fsd/entities/voip';
import { Icon, Menu } from '@fsd/shared/ui-kit';
import { MenuItemStaffCallProps } from './props';

export const MenuItemStaffCall = ({ mode, phone, text }: MenuItemStaffCallProps): JSX.Element => {
	const callP2P = useCallP2P();

	if (mode === 'voip' && typeof phone !== 'undefined') {
		return (
			<Menu.Item
				icon={<Icon name="call-phone" color="orange" />}
				onClick={() => callP2P({ receiver: String(phone) })}
			>
				{text || 'Внутренний'}
			</Menu.Item>
		);
	}

	if (mode === 'mobile' && typeof phone !== 'undefined') {
		return (
			<Menu.Item
				icon={<Icon name="call-mobile" color="orange" />}
				onClick={() => callP2P({ receiver: String(phone) })}
			>
				{text && text.length > 0 ? text : 'Мобильный'}
			</Menu.Item>
		);
	}

	return <></>;
};
