import { FC, FormEvent, useCallback, useMemo, useState } from 'react';
import { ISearchFormProps, ISearchModalChangeForm } from './search-form.types';
import { useValidate } from './useValidate';
import { CrmContactService } from '@fsd/entities/crm-contact';
import { CrmOrganizationConst } from '@fsd/entities/crm-organization';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Input, Modal, TextField } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { useActions } from '../../lib/use-actions';
import css from './search-form.module.scss';

export const SearchForm: FC<ISearchFormProps> = (props) => {
	const { data, onClose } = props;

	const [notFoundError, setNotFoundError] = useState<boolean>(false);
	const actions = useActions();
	const [search] = CrmContactService.search();
	const formName = useStateSelector((state) => state.crm_contact_card_info.forms.search.name);
	const [errorName, setErrorName] = useState<string | null>(null);
	const formPhone = useStateSelector((state) => state.crm_contact_card_info.forms.search.phone);
	const [errorPhone, setErrorPhone] = useState<string | null>(null);
	const isNotFound = useMemo<boolean>(() => errorName !== null || errorPhone !== null, [errorName, errorPhone]);
	const isEmptySearch = useMemo<boolean>(
		() => formName.length === 0 && formPhone.length === 0,
		[formName, formPhone]
	);
	const { team } = useUserDeprecated();
	const isAdminAccess = useAccess({ access: CrmOrganizationConst.Access.Admin });

	const validate = useValidate({ setErrorName, setErrorPhone });

	const handleChangeForm = useCallback(
		({ field, value }: ISearchModalChangeForm) => {
			if (notFoundError) {
				setNotFoundError(false);
			}
			actions.setSearchForm({ [field]: value });
		},
		[actions, notFoundError]
	);

	const handleSearch = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (isEmptySearch || !team) {
				return;
			}
			actions.setLoading(true);
			const isValidate = await validate();
			if (!isValidate) {
				return;
			}

			const response = await search({
				search: formName.length > 0 ? formName : formPhone,
				where: {
					userIds: isAdminAccess ? undefined : team,
				},
				ignore: {
					ids: data.map((item) => Number(item.id)),
				},
			});

			const searchResult = response?.data?.data ?? [];

			if (!searchResult.length) {
				setNotFoundError(true);
				if (formName.length > 0) {
					setErrorName(' ');
				}
				if (formPhone.length > 0) {
					setErrorPhone(' ');
				}
				actions.setLoading(false);
				return;
			}

			actions.setSearchResult(searchResult);
			actions.setSearchStep('connect');
			actions.setLoading(false);
		},
		[isEmptySearch, team, actions, validate, search, formName, formPhone, isAdminAccess, data]
	);

	const handleCreate = useCallback(() => {
		actions.setSearchStep('create');
	}, [actions]);

	return (
		<>
			<TextField className={css.description}>
				Укажите имя или телефон контакта. Для поиска по имени контакта возможен неточный поиск, в то время как
				для телефона нужно указать все цифры, включая код оператора.
			</TextField>

			{notFoundError && (
				<TextField className={css.notFound}>
					По Вашему запросу ничего не найдено. Попробуйте изменить параметры поиска.
				</TextField>
			)}

			<form onSubmit={handleSearch}>
				<div className={css.wrapper}>
					<Input
						label={'ФИО'}
						value={formName}
						onChange={(event) => {
							if (errorName) {
								setErrorName(null);
							}
							handleChangeForm({ field: 'name', value: event.target.value });
						}}
						onBlur={() => {
							validate().then();
						}}
						error={errorName}
						disabled={formPhone.length > 0}
					/>

					<Input
						label={'Телефон'}
						mode={'phone'}
						value={formPhone}
						onChange={(event) => {
							if (errorPhone) {
								setErrorPhone(null);
							}
							handleChangeForm({ field: 'phone', value: event as unknown as string });
						}}
						onBlur={() => {
							validate().then();
						}}
						error={errorPhone}
						disabled={formName.length > 0}
					/>
				</div>

				<Modal.Buttons>
					<Button onClick={onClose}> Отмена </Button>

					<Button
						color={'primary'}
						variant={'hard'}
						type={'submit'}
						iconLeft={<Icon name={'search'} />}
						disabled={isEmptySearch || isNotFound}
					>
						{' '}
						Найти{' '}
					</Button>

					<Button
						color={'primary'}
						variant={'hard'}
						onClick={handleCreate}
						disabled={!isEmptySearch && !isNotFound}
						iconLeft={<Icon name={'plus-medium'} />}
					>
						{' '}
						Добавить новый{' '}
					</Button>
				</Modal.Buttons>
			</form>
		</>
	);
};
