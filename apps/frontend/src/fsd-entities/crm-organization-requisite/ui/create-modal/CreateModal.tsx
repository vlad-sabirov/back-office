import { FC, FormEvent, useCallback } from 'react';
import { ICreateModalChangeError, ICreateModalChangeForm, ICreateModalProps } from './create-modal.types';
import { useValidate } from './useValidate';
import { FormCode1c } from '@fsd/entities/crm-organization-requisite/ui/form-code-1c/FormCode1c';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Modal, TextField } from '@fsd/shared/ui-kit';
import { useActions } from '../../lib/use-actions';
import { FormInn } from '../form-inn/FormInn';
import { FormName } from '../form-name/FormName';
import css from './create-modal.module.scss';

export const CreateModal: FC<ICreateModalProps> = (props) => {
	const { data, onCreate } = props;

	const isLoading = useStateSelector((state) => state.crm_organization_requisite.loading);
	const isModalOpen = useStateSelector((state) => state.crm_organization_requisite.modals.create);
	const actions = useActions();
	const validate = useValidate(data);

	const nameVal = useStateSelector((state) => state.crm_organization_requisite.form.create.name);
	const nameErr = useStateSelector((state) => state.crm_organization_requisite.error.create.name);

	const innVal = useStateSelector((state) => state.crm_organization_requisite.form.create.inn);
	const innErr = useStateSelector((state) => state.crm_organization_requisite.error.create.inn);

	const code1cVal = useStateSelector((state) => state.crm_organization_requisite.form.create.code1c);
	const code1cErr = useStateSelector((state) => state.crm_organization_requisite.error.create.code1c);

	const handleModalClose = useCallback(() => {
		actions.setModal(['create', false]);
	}, [actions]);

	const handleSave = useCallback(async () => {
		const isValidate = await validate();
		if (!isValidate) {
			actions.setLoading(false);
			return;
		}

		onCreate({
			id: new Date().getTime().toString(),
			type: 'created',
			name: nameVal.trim(),
			inn: innVal ? innVal.trim() : '',
			code1c: code1cVal.trim(),
		});
		actions.setClearFormCreate();
	}, [actions, innVal, code1cVal, nameVal, onCreate, validate]);

	const handleSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			handleSave().then();
		},
		[handleSave]
	);

	const handleChangeForm = useCallback(
		([field, value]: ICreateModalChangeForm) => {
			actions.setFormCreate({ [field]: value });
		},
		[actions]
	);

	const handleChangeError = useCallback(
		([field, value]: ICreateModalChangeError) => {
			actions.setErrorCreate({ [field]: value });
		},
		[actions]
	);

	return (
		<Modal
			title={'Добавление реквизита'}
			opened={isModalOpen}
			onClose={handleModalClose}
			size={440}
			loading={isLoading}
		>
			<TextField className={css.description} size={'small'}>
				Введите название контрагента, Код из 1С и уникальный ИНН для добавления реквизита.
			</TextField>

			<form onSubmit={handleSubmit} className={css.wrapper}>
				<FormName
					data={data}
					value={nameVal}
					onChange={(value) => {
						handleChangeForm(['name', value]);
					}}
					error={nameErr}
					onError={(value) => {
						handleChangeError(['name', value]);
					}}
					required
				/>

				<FormCode1c
					data={data}
					value={code1cVal}
					onChange={(value) => {
						handleChangeForm(['code1c', value]);
					}}
					error={code1cErr}
					onError={(value) => {
						handleChangeError(['code1c', value]);
					}}
					required
				/>

				<FormInn
					data={data}
					value={innVal ?? ''}
					onChange={(value) => {
						handleChangeForm(['inn', value]);
					}}
					error={innErr}
					onError={(value) => {
						handleChangeError(['inn', value]);
					}}
				/>
			</form>

			<Modal.Buttons>
				<Button onClick={handleModalClose}> Отмена </Button>

				<Button color={'primary'} variant={'hard'} onClick={handleSave}>
					{' '}
					Сохранить{' '}
				</Button>
			</Modal.Buttons>
		</Modal>
	);
};
