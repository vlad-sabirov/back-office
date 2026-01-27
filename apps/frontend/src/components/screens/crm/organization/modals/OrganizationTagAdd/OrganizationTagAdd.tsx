import { FC, FormEvent, useState } from 'react';
import Head from 'next/head';
import { Button, Input, Modal } from '@fsd/shared/ui-kit';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { CrmOrganizationTagService } from '@services';
import { OrganizationTagAddModalProps } from '.';

export const OrganizationTagAdd: FC<OrganizationTagAddModalProps> = ({
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
		setIsLoading(true);
		const { name } = form.values;

		if (name.length < 3 || name.length > 50) {
			form.setFieldError('name', 'Название должно быть от 3 до 50 символов');
			setIsLoading(false);
			return;
		}

		const [, error] = await CrmOrganizationTagService.create({ createDto: { name: name.trim() } });
		if (error) {
			showNotification({ color: 'red', message: error.message });
			setIsLoading(false);
			return;
		}

		showNotification({ color: 'green', message: 'Тег успешно добавлен' });
		onSuccess?.();
		setIsLoading(false);
		handleClose();
	};

	return (
		<Modal title="Добавление тега" opened={isOpen} onClose={handleClose} size={320} loading={isLoading}>
			<Head>
				<title>Добавление</title>
			</Head>
			<form onSubmit={(event) => handleSubmit(event)} className={className} {...props}>
				<Input label={'Тег'} required {...form.getInputProps('name')} />
				<Modal.Buttons>
					<Button color={'primary'} variant={'hard'} type={'submit'}>
						Добавить
					</Button>
				</Modal.Buttons>
			</form>
		</Modal>
	);
};
