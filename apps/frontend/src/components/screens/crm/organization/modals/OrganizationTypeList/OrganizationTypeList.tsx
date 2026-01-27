import { FC, useContext, useState } from 'react';
import cn from 'classnames';
import Head from 'next/head';
import { Button, Icon, Menu, Modal, TextField } from '@fsd/shared/ui-kit';
import { CrmOrganizationTypeResponse } from '@interfaces';
import { OrganizationContext } from '@screens/crm';
import { OrganizationTypeAdd, OrganizationTypeDelete, OrganizationTypeEdit } from '../';
import { OrganizationTypeListModalProps } from '.';
import css from './organization-type-list.module.scss';

export const OrganizationTypeList: FC<OrganizationTypeListModalProps> = ({ isOpen, setOpen, className, ...props }) => {
	const Store = useContext(OrganizationContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [modalTypeAdd, setModalTypeAdd] = useState<boolean>(false);
	const [modalTypeEdit, setModalTypeEdit] = useState<boolean>(false);
	const [modalTypeDelete, setModalTypeDelete] = useState<boolean>(false);
	const [currentType, setCurrentType] = useState<CrmOrganizationTypeResponse | null>(null);

	const handleRefreshData = async (): Promise<void> => await Store.getDataTypeList();

	const handleClose = (): void => {
		setIsLoading(false);
		setOpen(false);
	};

	return (
		<>
			<Modal title="Виды деятельности" opened={isOpen} onClose={handleClose} size={400} loading={isLoading}>
				<Head>
					<title>Виды деятельности</title>
				</Head>
				<div className={className} {...props}>
					<div className={css.wrapper}>
						{Store.dataTypeList.length > 0 &&
							Store.dataTypeList.map((dataItem, index) => {
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
												setCurrentType(dataItem);
												setModalTypeEdit(true);
											}}
										>
											Изменить
										</Menu.Item>

										<Menu.Item
											color={'red'}
											icon={<Icon name={'trash'} />}
											onClick={() => {
												setCurrentType(dataItem);
												setModalTypeDelete(true);
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
							onClick={() => setModalTypeAdd(true)}
						>
							Добавить
						</Button>
					</Modal.Buttons>
				</div>
			</Modal>

			<OrganizationTypeAdd isOpen={modalTypeAdd} setOpen={setModalTypeAdd} onSuccess={handleRefreshData} />
			<OrganizationTypeEdit
				isOpen={modalTypeEdit}
				setOpen={setModalTypeEdit}
				onSuccess={handleRefreshData}
				data={currentType}
			/>
			<OrganizationTypeDelete
				isOpen={modalTypeDelete}
				setOpen={setModalTypeDelete}
				onSuccess={handleRefreshData}
				data={currentType}
			/>
		</>
	);
};
