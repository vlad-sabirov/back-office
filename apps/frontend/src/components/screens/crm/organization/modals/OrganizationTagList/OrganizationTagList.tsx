import { FC, useContext, useState } from 'react';
import cn from 'classnames';
import Head from 'next/head';
import { Button, Icon, Menu, Modal, TextField } from '@fsd/shared/ui-kit';
import { CrmOrganizationTagResponse } from '@interfaces';
import { OrganizationContext } from '@screens/crm';
import { OrganizationTagAdd, OrganizationTagDelete, OrganizationTagEdit } from '../';
import { OrganizationTagListModalProps } from '.';
import css from './organization-tag-list.module.scss';

export const OrganizationTagList: FC<OrganizationTagListModalProps> = ({ isOpen, setOpen, className, ...props }) => {
	const Store = useContext(OrganizationContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [modalTagAdd, setModalTagAdd] = useState<boolean>(false);
	const [modalTagEdit, setModalTagEdit] = useState<boolean>(false);
	const [modalTagDelete, setModalTagDelete] = useState<boolean>(false);
	const [currentTag, setCurrentTag] = useState<CrmOrganizationTagResponse | null>(null);

	const handleRefreshData = async (): Promise<void> => {
		await Store.getDataTagList();
	};

	const handleClose = (): void => {
		setIsLoading(false);
		setOpen(false);
	};

	return (
		<>
			<Modal title="Теги" opened={isOpen} onClose={handleClose} size={400} loading={isLoading}>
				<Head>
					<title>Теги</title>
				</Head>
				<div className={className} {...props}>
					<div className={css.wrapper}>
						{Store.dataTagList.length > 0 &&
							Store.dataTagList.map((dataItem, index) => {
								return (
									<Menu
										withArrow
										key={dataItem.id}
										offset={-12}
										control={
											<div key={dataItem.id}>
												<TextField className={cn(css.item, { [css.item__second]: index % 2 })}>
													{dataItem.name}
												</TextField>
											</div>
										}
									>
										<Menu.Item
											color={'blue'}
											icon={<Icon name={'edit'} />}
											onClick={() => {
												setCurrentTag(dataItem);
												setModalTagEdit(true);
											}}
										>
											Изменить
										</Menu.Item>

										<Menu.Item
											color={'red'}
											icon={<Icon name={'trash'} />}
											onClick={() => {
												setCurrentTag(dataItem);
												setModalTagDelete(true);
											}}
										>
											Удалить
										</Menu.Item>
									</Menu>
								);
							})}
					</div>

					<Modal.Buttons>
						<Button
							color="primary"
							variant="hard"
							iconLeft={<Icon name={'plus-medium'} style={{ width: 12 }} />}
							onClick={() => setModalTagAdd(true)}
						>
							Добавить
						</Button>
					</Modal.Buttons>
				</div>
			</Modal>

			<OrganizationTagAdd isOpen={modalTagAdd} setOpen={setModalTagAdd} onSuccess={handleRefreshData} />
			<OrganizationTagEdit
				isOpen={modalTagEdit}
				setOpen={setModalTagEdit}
				onSuccess={handleRefreshData}
				data={currentTag}
			/>
			<OrganizationTagDelete
				isOpen={modalTagDelete}
				setOpen={setModalTagDelete}
				onSuccess={handleRefreshData}
				data={currentTag}
			/>
		</>
	);
};
