import { FC, useContext, useState } from 'react';
import Head from 'next/head';
import { Button, Drawer, Icon } from '@fsd/shared/ui-kit';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import * as lodash from 'lodash';
import * as Props from '.';
import * as Form from './forms';
import cn from 'classnames';
import css from './organization-add-drawer.module.scss';
import { Divider, Tooltip } from '@mantine/core';
import { OrganizationContext } from '../../Organization.screen';
import { useStateActions, useStateSelector } from '@fsd/shared/lib/hooks';
import { CrmOrganizationActions } from '@fsd/entities/crm-organization';
import { useFetch } from './lib/useFetch';

export const OrganizationAddDrawer: FC<Props.OrganizationAddDrawerProps> = (
	{ className, ...props }
) => {
	const Store = useContext(OrganizationContext);
	const open = useStateSelector((state) => state.crm_organization.modals.create);
	const organizationActions = useStateActions(CrmOrganizationActions);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isShowMore, setIsShowMore] = useState<boolean>(false);
	
	const form = useForm<Props.OrganizationAddDrawerFormFieldsProps>({
		initialValues: {
			organization: {
				name: '',
				firstDocument: '',
				website: '',
				comment: '',
				userId: '',
				typeId: '',
			},
			tags: [],
			phones: [{value: '', comment: ''}],
			emails: [{value: '', comment: ''}],
			requisites: [],
			contacts: [],
		}
	});
	const fetch = useFetch(form);

	const handleShowMore = () => {
		setIsShowMore(old => !old);
	}

	const handleModalClose = () => {
		form.reset();
		organizationActions.setModalShow({ modal: 'create', show: false });
		setIsShowMore(false);
	};

	const handleSubmit = async () => {
		setIsLoading(true);

		const isValidate = await Form.validateAll({ form })
		if (!isValidate) {
			setIsLoading(false);
			return;
		} 

		// const Fetch = new OrganizationAddDrawerFetch(form);
		// await Fetch.exec();
		// if (Fetch.err) {
		// 	showNotification({ color: 'red', message: Fetch.err });
		// 	setIsLoading(false);
		// 	return;
		// }
		const [, fetchErr] = await fetch();
		if (fetchErr) {
			showNotification({ color: 'red', message: fetchErr });
			setIsLoading(false);
			return;
		}
		
		Store.getDataOrganizationListTimeStamp();
		showNotification({ color: 'green', message: 'Данные сохранены в базе' });
		setIsLoading(false);
		handleModalClose();
	};

return (
	<>
		{open && (<Head><title>Добавление организации</title></Head>)}

		<Drawer
			title={'Добавление организации'}
			width={480}
			opened={open}
			onClose={handleModalClose}
			loading={isLoading}
			position={'left'}
		>
			<div className={cn(css.wrapper, className)} {...props}>
				<div className={css.form}>
					<Form.Name form={form} />
					<Form.FirstDocument form={form} />
					<Form.User form={form} />
					<Form.Type form={form} />
					{isShowMore && <Form.Website form={form} />}
					<Form.Phones form={form} />
					{isShowMore && <Form.Emails form={form} />}
					{isShowMore && <Form.Tags form={form} />}
					
					<Tooltip
						label={`${isShowMore ? 'Скрыть' : 'Показать'} дополнительные поля`}
						withArrow offset={-12}
					>
						<div className={css.more} onClick={handleShowMore}>
							<Icon
								name={'arrow-medium'}
								className={isShowMore ? css.more__active : undefined}
							/>
						</div>
					</Tooltip>

					<Divider />
					<Form.Requisites form={form} />
					<Divider />
					<Form.Contacts form={form} />
					<Divider />
					<Form.Comment form={form} />
				</div>
				
				<div className={css.buttons}>
					<Button
						onClick={handleModalClose}
					> Отмена </Button>

					<Button
						color={'primary'}
						variant={'hard'}
						onClick={handleSubmit}
						disabled={!lodash.isEmpty(form.errors)}
					> Сохранить </Button>
				</div>
			</div>
		</Drawer>
	</>
)};
