import { FC, FormEvent, useEffect, useMemo, useState } from 'react';
import cn from 'classnames';
import { capitalize } from 'lodash';
import { CrmOrganizationTagService, useCrmOrganizationTagActions } from '@fsd/entities/crm-organization-tag';
import { FetchStatusConvert, FetchStatusIsLoading, FetchStatusIsUpdate } from '@fsd/shared/lib/fetch-status';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Input, Modal, TextField } from '@fsd/shared/ui-kit';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useValidate } from '../lib/useValidate';
import { IFormValues, ITagMutationProps } from '../types/tag-mutation.props';
import css from './type-mutation.module.scss';

export const TagMutation: FC<ITagMutationProps> = ({ className, ...props }) => {
	const isCreate = useStateSelector((state) => state.crm_organization_tag.modals.create);
	const isUpdate = useStateSelector((state) => state.crm_organization_tag.modals.update);
	const isOpen = useMemo(() => isCreate || isUpdate, [isCreate, isUpdate]);
	const tagActions = useCrmOrganizationTagActions();
	const status = useStateSelector((state) => state.crm_organization_tag.status.current);
	const dataCurrent = useStateSelector((state) => state.crm_organization_tag.data.current);
	const [createTag, { error: crateError, ...createProps }] = CrmOrganizationTagService.create();
	const [updateTag, { error: updateError, ...updateProps }] = CrmOrganizationTagService.update();
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
		tagActions.setModalShow({ modal: 'create', show: false });
		tagActions.setModalShow({ modal: 'update', show: false });
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
		await createTag({ name });
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
			message: `Тег добавлен`,
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
		await updateTag({ id: dataCurrent.id, updateDto: { name } });
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
		tagActions.setModalShow({ modal: 'delete', show: true });
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
			title={`${isCreate ? 'Добавление' : 'Изменение'} тега`}
			size={480}
			opened={isOpen}
			onClose={handleClose}
			loading={isLoadingLocal || (isUpdate ? isLoadingCurrent || isLoadingUpdate : isLoadingCreate)}
		>
			<div className={cn(css.wrapper, className)} {...props}>
				<TextField size={'small'} className={css.description}>
					Укажите название тега. Название должно быть уникальным. Также обратите внимание, что название не
					чувствительно к регистру букв.
				</TextField>

				<form className={css.form} onSubmit={isCreate ? handleCreate : handleUpdate}>
					<Input label={'Тег'} {...form.getInputProps('name')} required />
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
