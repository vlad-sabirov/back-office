import { FC, useCallback, useEffect, useState } from 'react';
import { ISearchModalProps } from './search-modal.types';
import { SearchTabs } from './search-tabs/SearchTabs';
import { SearchConst, useSearchActions } from '@fsd/entities/search';
import { useAccess, useDebounce, useStateSelector } from '@fsd/shared/lib/hooks';
import { Icon, Input, Modal } from '@fsd/shared/ui-kit';
import { useFocusTrap, useHotkeys } from '@mantine/hooks';
import css from './search-modal.module.scss';

export const SearchModal: FC<ISearchModalProps> = ({ title, size, ...rest }) => {
	const searchIsShowModal = useStateSelector((state) => state.search.isShowModal);
	const searchActions = useSearchActions();
	const [value, setValue] = useState<string>('');
	const isAccessToHotkey = useAccess({ access: SearchConst.Access.ModalHotkey });

	const handleSearch = useDebounce((value: string) => {
		searchActions.setValue(value);
	}, 300);

	useEffect(() => {
		if (searchIsShowModal) {
			return;
		}
		setValue('');
	}, [searchIsShowModal]);

	useEffect(() => handleSearch(value), [handleSearch, value]);

	const focusTrapRef = useFocusTrap();
	useHotkeys([
		[
			'ctrl + /',
			() => {
				if (!isAccessToHotkey) {
					return;
				}
				searchActions.setIsShowModal(true);
			},
		],
	]);

	const handleModalClose = useCallback(() => {
		searchActions.setIsShowModal(false);
	}, [searchActions]);

	return (
		<Modal
			title={title || 'Поиск по базе...'}
			opened={searchIsShowModal}
			onClose={handleModalClose}
			size={size || 600}
			{...rest}
		>
			<div ref={focusTrapRef}>
				<Input
					iconLeft={<Icon name={'search'} />}
					placeholder={'Введите поисковый запрос...'}
					value={value}
					onChange={(e) => setValue(e.currentTarget.value)}
					data-autofocus
					className={css.input}
				/>

				<SearchTabs />
			</div>
		</Modal>
	);
};
