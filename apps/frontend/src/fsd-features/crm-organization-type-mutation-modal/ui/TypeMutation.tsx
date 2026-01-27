import { FC, FormEvent, useEffect, useMemo, useState } from 'react';
import cn from 'classnames';
import { capitalize } from 'lodash';
import { CrmOrganizationTypeActions, CrmOrganizationTypeService } from '@fsd/entities/crm-organization-type';
import { FetchStatusConvert, FetchStatusIsLoading, FetchStatusIsUpdate } from '@fsd/shared/lib/fetch-status';
import { useStateActions, useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Input, Modal, TextField } from '@fsd/shared/ui-kit';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useValidate } from '../lib/useValidate';
import { IFormValues, ITypeMutationProps } from '../types/type-mutation.props';
import css from './type-mutation.module.scss';

export const TypeMutation: FC<ITypeMutationProps> = ({ className, ...props }) => {
	const isCreate = useStateSelector((state) => state.crm_organization_type.modals.create);
	const isUpdate = useStateSelector((state) => state.crm_organization_type.modals.update);
	const isOpen = useMemo(() => isCreate || isUpdate, [isCreate, isUpdate]);
	const typeActions = useStateActions(CrmOrganizationTypeActions);
	const status = useStateSelector((state) => state.crm_organization_type.status.current);
	const dataCurrent = useStateSelector((state) => state.crm_organization_type.data.current);
	const [createType, { error: crateError, ...createProps }] = CrmOrganizationTypeService.createType();
	const [updateType, { error: updateError, ...updateProps }] = CrmOrganizationTypeService.updateType();
	const [isLoadingLocal, setIsLoadingLocal] = useState<boolean>(false);
	const isLoadingCurrent = useMemo(() => FetchStatusIsLoading(status), [status]);
	const isLoadingCreate = useMemo(() => FetchStatusIsUpdate(FetchStatusConvert(createProps)), [createProps]);
	const isLoadingUpdate = useMemo(() => FetchStatusIsUpdate(FetchStatusConvert(updateProps)), [updateProps]);

	const form = useForm<IFormValues>({
		initialValues: {
			name: '',
		},
	});
	const validate = useValidate();

	const handleClose = () => {
		form.reset();
		typeActions.setModalShow({ modal: 'create', show: false });
		typeActions.setModalShow({ modal: 'update', show: false });
		setIsLoadingLocal(false);
	};

	const handleCreate = async (event?: FormEvent<HTMLFormElement>) => {
		event?.preventDefault();
		setIsLoadingLocal(true);
		const isValidate = await validate({ form });
		if (!isValidate) {
			setIsLoadingLocal(false);
			return;
		}
		const { name } = form.values;
		await createType({ name });
		if (crateError) {
			showNotification({
				color: 'red',
				message: 'Неизвестная ошибка. Обратитесь за помощью в IT отдел',
			});
			setIsLoadingLocal(false);
			return;
		}
		showNotification({
			color: 'green',
			message: `Вид деятельности добавлен`,
		});
		handleClose();
	};

	const handleUpdate = async (event?: FormEvent<HTMLFormElement>) => {
		event?.preventDefault();
		if (!dataCurrent) {
			return;
		}
		setIsLoadingLocal(true);
		const isValidate = await validate({ form, ignoreId: dataCurrent.id });
		if (!isValidate) {
			setIsLoadingLocal(false);
			return;
		}
		const { name } = form.values;
		await updateType({ id: dataCurrent.id, updateDto: { name } });
		if (updateError) {
			showNotification({
				color: 'red',
				message: 'Неизвестная ошибка. Обратитесь за помощью в IT отдел',
			});
			setIsLoadingLocal(false);
			return;
		}
		showNotification({
			color: 'green',
			message: `Изменения сохранены`,
		});
		handleClose();
	};

	const handleDelete = () => {
		typeActions.setModalShow({ modal: 'delete', show: true });
	};

	useEffect(() => {
		if (isLoadingCurrent || !isUpdate) {
			return;
		}
		form.setValues({ name: dataCurrent?.name ? capitalize(dataCurrent.name) : '' });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoadingCurrent]);

	return (
		<Modal
			title={`${isCreate ? 'Добавление' : 'Изменение'} вида деятельности`}
			size={520}
			opened={isOpen}
			onClose={handleClose}
			loading={isLoadingLocal || (isUpdate ? isLoadingCurrent || isLoadingUpdate : isLoadingCreate)}
		>
			<div className={cn(css.wrapper, className)} {...props}>
				<TextField size={'small'} className={css.description}>
					Укажите название вида деятельности. Название должно быть уникальным. Также обратите внимание, что
					название не чувствительно к регистру букв.
				</TextField>

				<form className={css.form} onSubmit={isCreate ? handleCreate : handleUpdate}>
					<Input label={'Название вида деятельности'} {...form.getInputProps('name')} required />
				</form>
			</div>

			<Modal.Buttons className={css.buttons}>
				<div>
					{isUpdate && (
						<Button
							color={'error'}
							variant={'hard'}
							onClick={handleDelete}
							iconLeft={<Icon name={'trash'} />}
						>
							{' '}
							Удалить{' '}
						</Button>
					)}
				</div>

				<div></div>

				<Button onClick={handleClose}> Отмена </Button>

				<Button
					color={'success'}
					variant={'hard'}
					onClick={() => {
						if (isCreate) {
							handleCreate().then();
						}
						if (isUpdate) {
							handleUpdate().then();
						}
					}}
				>
					{' '}
					{isCreate ? 'Добавить' : 'Сохранить'}{' '}
				</Button>
			</Modal.Buttons>
		</Modal>
	);
};
