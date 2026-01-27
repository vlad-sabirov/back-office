import { FC, FormEvent, useCallback, useState } from 'react';
import { CrmOrganizationService } from '@fsd/entities/crm-organization';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Input, Modal, TextField } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { useActions } from '../../lib/useActions/useActions';
import { ISliceInitialStateFormFind } from '../../model/org-card-info.slice.types';
import { ICardInfo } from '../card-info/card-info.types';
import css from './find-form.module.scss';

export const FindForm: FC<ICardInfo> = ({ value: values }) => {
	const actions = useActions();
	const formValues = useStateSelector((state) => state.crm_organizations_card_info.find.form);
	const [search] = CrmOrganizationService.search();
	const [emptyResult, setEmptyResult] = useState<boolean>(false);
	const { team } = useUserDeprecated();
	const crmAdmin = useAccess({ access: ['crmAdmin', 'boss', 'developer'] });

	const handleChangeInput = useCallback(([key, value]: [keyof ISliceInitialStateFormFind, string]) => {
		actions.setFindForm([key, value]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleClose = useCallback(() => {
		actions.setShowModal(['add', false]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSearch = useCallback(
		async (e: FormEvent<HTMLFormElement>) => {
			if (!values) {
				return;
			}
			e.preventDefault();
			e.stopPropagation();
			actions.setIsLoading(true);
			const searchValue = formValues.name || formValues.phone || formValues.inn;
			const { data: findValue } = await search({
				search: searchValue,
				ignore: { ids: values.map((item) => Number(item.id)) },
				where: {
					userIds: !crmAdmin ? team?.map((id) => Number(id)) : undefined,
				},
			});
			if (findValue?.data && findValue.data.length > 0) {
				actions.setFindData(findValue.data);
				actions.setFindStatus('connect');
			} else {
				setEmptyResult(true);
			}
			actions.setIsLoading(false);
		},
		[actions, crmAdmin, formValues.inn, formValues.name, formValues.phone, search, team, values]
	);

	return (
		<div>
			<TextField className={css.description} size={'small'}>
				Введите Название организации, один из телефонов или ИНН для поиска организации в системе.
			</TextField>

			{emptyResult && (
				<TextField className={css.emptyResult}>
					По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска и повторить запрос.
				</TextField>
			)}

			<form onSubmit={handleSearch} className={css.form}>
				<Input
					label={'Название организации'}
					value={formValues.name}
					onChange={(e) => handleChangeInput(['name', e.target.value])}
					disabled={formValues.inn.length > 0 || formValues.phone.length > 0}
					className={css.name}
				/>

				<Input
					label={'Телефон'}
					value={formValues.phone}
					onChange={(e) => handleChangeInput(['phone', e.target.value.replace(/\D/g, '')])}
					disabled={formValues.inn.length > 0 || formValues.name.length > 0}
					className={css.phone}
				/>

				<Input
					label={'ИНН'}
					value={formValues.inn}
					onChange={(e) => handleChangeInput(['inn', e.target.value.replace(/\D/g, '')])}
					disabled={formValues.phone.length > 0 || formValues.name.length > 0}
					className={css.inn}
				/>

				<Modal.Buttons className={css.buttons}>
					<Button onClick={handleClose}> Отмена </Button>

					<Button color={'primary'} variant={'hard'} iconLeft={<Icon name={'search'} />} type={'submit'}>
						{' '}
						Найти{' '}
					</Button>
				</Modal.Buttons>
			</form>
		</div>
	);
};
