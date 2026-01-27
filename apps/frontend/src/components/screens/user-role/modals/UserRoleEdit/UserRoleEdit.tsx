import { FC, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { Button, Input, Modal, Textarea } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { UserRoleContext } from '../../UserRole';
import UserRoleConstants from '../../user-role.constants';
import UserRoleService from '../../user-role.service';
import css from './styles.module.scss';

export const UserRoleEdit: FC = observer(() => {
	const { modalStore } = useContext(MainContext);
	const { userRoleStore } = useContext(UserRoleContext);

	const form = useForm({
		initialValues: {
			alias: '' as string,
			description: '' as string,
		},
	});

	const closeSelfModal = () => {
		modalStore.modalOpen('userRoleEdit', false);
		form.reset();
	};

	useEffect(() => {
		if (modalStore.modals.userRoleEdit && userRoleStore.roleCurrent) {
			form.setFieldValue('alias', userRoleStore.roleCurrent?.alias);
			form.setFieldValue('description', userRoleStore.roleCurrent?.description);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalStore, userRoleStore, userRoleStore.roleCurrent, modalStore.modals.userRoleEdit]);

	const onSubmit = async () => {
		if (!userRoleStore.roleCurrent) return;
		const { alias, description } = form.values;

		if (alias.length < 3 || alias.length > 32) {
			form.setFieldError('alias', UserRoleConstants.VALIDATION.ALIAS.WRONG_LENGTH);
			return;
		}

		const [findByAliasResponse] = await UserRoleService.findByAlias(alias);
		if (findByAliasResponse && findByAliasResponse.id !== userRoleStore.roleCurrent.id) {
			form.setFieldError('alias', UserRoleConstants.VALIDATION.ALIAS.DUPLICATE);
			return;
		}

		if (description.length < 4 || description.length > 256) {
			form.setFieldError('description', UserRoleConstants.VALIDATION.DESCRIPTION.WRONG_LENGTH);
			return;
		}

		const [createRoleResponse, createRoleError] = await UserRoleService.updateById(userRoleStore.roleCurrent.id, {
			roleDto: { alias, description },
		});
		await userRoleStore.getRoleList();

		if (createRoleError) {
			showNotification({
				message: createRoleError.message,
				color: 'red',
			});
		}

		if (createRoleResponse) {
			showNotification({
				message: `Пользовательская роль ${alias} изменена!`,
				color: 'green',
			});
			closeSelfModal();
		}
	};

	return (
		<Modal title="Изменение роли" opened={modalStore.modals.userRoleEdit} onClose={closeSelfModal} size={400}>
			<Head>
				<title>Изменение роли ${userRoleStore.roleCurrent?.alias}. Back Office</title>
			</Head>

			<form className={css.wrapper} onSubmit={form.onSubmit(onSubmit)}>
				<Input label="Алиас" required {...form.getInputProps('alias')} />
				<Textarea label="Описание" required {...form.getInputProps('description')} />
			</form>

			<Modal.Buttons>
				<Button onClick={closeSelfModal}>Отмена</Button>
				<Button color="primary" variant="hard" onClick={onSubmit}>
					Сохранить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
