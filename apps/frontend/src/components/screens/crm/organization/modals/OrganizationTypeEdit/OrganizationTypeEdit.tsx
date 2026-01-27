import { FC, FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import { Button, Input, Modal } from '@fsd/shared/ui-kit';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { CrmOrganizationTypeService } from '@services';
import { OrganizationTypeEditModalProps } from '.';

export const OrganizationTypeEdit: FC<OrganizationTypeEditModalProps> = ({
	data,
	isOpen,
	setOpen,
	onSuccess,
	className,
	...props
}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const form = useForm({ initialValues: { name: '' } });

	const handleClose = (): void => {
		setIsLoading(false);
		setOpen(false);
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
		event.preventDefault();
		event.stopPropagation();
		if (!data) return;
		setIsLoading(true);
		const { name } = form.values;

		if (name.length < 3 || name.length > 50) {
			form.setFieldError('name', 'Название должно быть от 3 до 50 символов');
			setIsLoading(false);
			return;
		}

		const [, error] = await CrmOrganizationTypeService.updateById(
			{
				id: data.id, 
				updateDto: { name: name.trim() }
			}
		);
		if (error) {
			showNotification({ color: 'red', message: error.message });
			setIsLoading(false);
			return;
		}

		showNotification({ color: 'green', message: 'Изменения сохранены' });
		onSuccess?.();
		setIsLoading(false);
		handleClose();
	};

	useEffect(() => {
		if (!data) return;
		form.setValues({ name: data.name });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	return (
		<Modal title="Изменение" opened={isOpen} onClose={handleClose} size={320} loading={isLoading}>
			<Head>
				<title>Изменение</title>
			</Head>
			{data && (
				<form onSubmit={(event) => handleSubmit(event)} className={className} {...props}>
					<Input label={'Сфера деятельности'} required {...form.getInputProps('name')} />
					<Modal.Buttons>
						<Button color={'primary'} variant={'hard'} type={'submit'}>
							Сохранить
						</Button>
					</Modal.Buttons>
				</form>
			)}
		</Modal>
	);
};
