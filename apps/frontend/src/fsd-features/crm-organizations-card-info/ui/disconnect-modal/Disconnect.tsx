import { FC, useCallback, useMemo } from 'react';
import { useCrmContactGetCurrent } from '@fsd/entities/crm-contact';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { useActions } from '../../lib/useActions/useActions';
import { ICardInfo } from '../card-info/card-info.types';
import css from './disconnect.module.scss';

export const DisconnectModal: FC<ICardInfo> = ({ value, onChange, changeField }) => {
	const isLoading = useStateSelector((state) => state.crm_organizations_card_info.isLoading);
	const isShow = useStateSelector((state) => state.crm_organizations_card_info.isShowModals.disconnect);
	const currentId = useStateSelector((state) => state.crm_organizations_card_info.disconnect.currentId);
	const activeOrganization = useMemo(() => value?.find((item) => item.id === currentId), [currentId, value]);
	const actions = useActions();
	const current = useStateSelector((state) => state.crm_contact.data.current);
	const [getCurrentFetch] = useCrmContactGetCurrent();

	const handleClose = useCallback(() => {
		actions.setShowModal(['disconnect', false]);
	}, [actions]);

	const handleDisconnect = useCallback(() => {
		if (!value || !currentId || !current) {
			return;
		}
		const newValue = value.filter((item) => item.id !== currentId);
		onChange({ field: changeField, value: newValue, error: '' });
		handleClose();
		getCurrentFetch({ id: current.id });
	}, [value, currentId, current, onChange, changeField, handleClose, getCurrentFetch]);

	if (!activeOrganization) {
		return null;
	}
	return (
		<Modal title={'Открепление'} opened={isShow} onClose={handleClose} size={440} loading={isLoading}>
			<TextField className={css.description}>
				Вы пытаетесь открепить организацию{' '}
				<span>
					{activeOrganization.nameEn} ({activeOrganization.nameRu})
				</span>{' '}
				от контакта.
			</TextField>

			<TextField className={css.description}>
				Важно понимать, что при этом организация из системы не удалится, а просто контакт больше не будет иметь
				связи с этой компанией.
			</TextField>

			<TextField className={css.description}>
				Связь контакта с организацией можно будет восстановить в любой момент.
			</TextField>

			<Modal.Buttons>
				<Button onClick={handleClose}>Отмена</Button>

				<Button
					color={'warning'}
					variant={'hard'}
					iconLeft={<Icon name={'trash'} />}
					onClick={handleDisconnect}
				>
					{' '}
					Открепить{' '}
				</Button>
			</Modal.Buttons>
		</Modal>
	);
};
