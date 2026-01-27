import { FC, useCallback, useEffect } from 'react';
import { ISearchModalProps } from './search-modal.types';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { Modal } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { useActions } from '../../lib/use-actions';
import { SearchConnect } from '../search-connect/SearchConnect';
import { SearchCreate } from '../search-create/SearchCreate';
import { SearchForm } from '../search-form/SearchForm';

export const SearchModal: FC<ISearchModalProps> = (props) => {
	const { data, dataPhones, dataEmails, onConnect, onCreate } = props;
	const isShowModal = useStateSelector((state) => state.crm_contact_card_info.modals.search);
	const isLoading = useStateSelector((state) => state.crm_contact_card_info.loading);
	const step = useStateSelector((state) => state.crm_contact_card_info.searchStep);
	const actions = useActions();
	const { userId } = useUserDeprecated();
	const isAdmin = useAccess({ access: ['boss', 'crmAdmin', 'developer'] });

	const handleModalClose = useCallback(() => {
		actions.setModal(['search', false]);
		actions.setSearchClear();
		actions.setLoading(false);
	}, [actions]);

	useEffect(() => {
		if (!isShowModal) {
			return;
		}
		actions.setCreateForm({ userId: isAdmin ? undefined : String(userId) });
	}, [actions, isAdmin, isShowModal, userId]);

	return (
		<Modal
			title={'Добавление контакта'}
			size={600}
			opened={isShowModal}
			onClose={handleModalClose}
			loading={isLoading}
		>
			{step === 'search' && <SearchForm onClose={handleModalClose} data={data} />}

			{step === 'connect' && <SearchConnect onConnect={onConnect} onClose={handleModalClose} />}

			{step === 'create' && (
				<SearchCreate
					data={data}
					dataPhones={dataPhones}
					dataEmails={dataEmails}
					onCreate={onCreate}
					onClose={handleModalClose}
				/>
			)}
		</Modal>
	);
};
