import { FC, FormEvent, useCallback, useEffect } from 'react';
import { IUpdateModalChangeError, IUpdateModalChangeForm, IUpdateModalProps } from './update-modal.types';
import { useValidate } from './useValidate';
import { FormCode1c } from '@fsd/entities/crm-organization-requisite/ui/form-code-1c/FormCode1c';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Modal, TextField } from '@fsd/shared/ui-kit';
import { useActions } from '../../lib/use-actions';
import { FormInn } from '../form-inn/FormInn';
import { FormName } from '../form-name/FormName';
import css from './update-modal.module.scss';

export const UpdateModal: FC<IUpdateModalProps> = (props) => {
	const { data, onUpdate } = props;

	const isLoading = useStateSelector((state) => state.crm_organization_requisite.loading);
	const isModalOpen = useStateSelector((state) => state.crm_organization_requisite.modals.update);
	const current = useStateSelector((state) => state.crm_organization_requisite.current);
	const actions = useActions();
	const validate = useValidate(data);

	const nameVal = useStateSelector((state) => state.crm_organization_requisite.form.update.name);
	const nameErr = useStateSelector((state) => state.crm_organization_requisite.error.update.name);

	const innVal = useStateSelector((state) => state.crm_organization_requisite.form.update.inn);
	const innErr = useStateSelector((state) => state.crm_organization_requisite.error.update.inn);

	const code1cVal = useStateSelector((state) => state.crm_organization_requisite.form.update.code1c);
	const code1cErr = useStateSelector((state) => state.crm_organization_requisite.error.update.code1c);

	const handleModalClose = useCallback(() => {
		actions.setModal(['update', false]);
	}, [actions]);

	const handleSave = useCallback(async () => {
		actions.setLoading(true);
		const isValidate = await validate();
		if (!isValidate) {
			actions.setLoading(false);
			return;
		}

		onUpdate({
			id: current?.id ?? new Date().getTime().toString(),
			type: 'created',
			name: nameVal.trim(),
			inn: innVal ? innVal.trim() : '',
			code1c: code1cVal.trim(),
		});
		actions.setModal(['update', false]);
		actions.setClearFormUpdate();
		actions.setLoading(false);
	}, [actions, current?.id, innVal, code1cVal, nameVal, onUpdate, validate]);

	const handleSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			handleSave().then();
		},
		[handleSave]
	);

	const handleChangeForm = useCallback(
		([field, value]: IUpdateModalChangeForm) => {
			actions.setFormUpdate({ [field]: value });
		},
		[actions]
	);

	const handleChangeError = useCallback(
		([field, value]: IUpdateModalChangeError) => {
			actions.setErrorUpdate({ [field]: value });
		},
		[actions]
	);

	useEffect(() => {
		if (isModalOpen && current) {
			actions.setFormUpdate({
				name: current.name,
				inn: current.inn,
				code1c: current.code1c,
			});
		}
	}, [isModalOpen, current, actions]);

	return (
		<Modal
			title={'Изменение реквизита'}
			opened={isModalOpen}
			onClose={handleModalClose}
			size={440}
			loading={isLoading}
		>
			<TextField className={css.description} size={'small'}>
				Измените название контрагента, Код 1С или ИНН. Введенные данные должны быть уникальными.
			</TextField>

			<form onSubmit={handleSubmit} className={css.wrapper}>
				<FormName
					data={data}
					ignoreData={data.filter((item) => item.id === current?.id)}
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
					ignoreData={data.filter((item) => item.id === current?.id)}
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
					ignoreData={data.filter((item) => item.id === current?.id)}
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
