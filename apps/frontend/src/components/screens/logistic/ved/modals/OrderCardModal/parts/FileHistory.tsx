import { useContext, useEffect, useState } from 'react';
import { format, formatDistance, parseISO } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Icon, Menu, Modal, Table, TextField } from '@fsd/shared/ui-kit';
import { customLocaleRu } from '@config/date-fns.locale';
import { MainContext } from '@globalStore';
import { Tooltip } from '@mantine/core';
import { ILogisticVedFileResponse } from '@screens/logistic';
import { MenuItemStaffUser } from '@fsd/shared/ui-kit/menu/items/MenuUser';
import { TablePropsData } from '@fsd/shared/ui-kit/table/Table.props';
import css from './FileHistory.module.scss';
import { StaffAvatar } from '@fsd/entities/staff';

export const LogisticOrderVedCardFileHistory = observer((): JSX.Element => {
	const { logisticStore } = useContext(MainContext);
	const [files, setFiles] = useState<ILogisticVedFileResponse[]>([]);

	useEffect(() => {
		if (!logisticStore.logisticVedOrderCurrent?.file?.length) return;
		setFiles(logisticStore.logisticVedOrderCurrent.file.filter((file) => file.type === logisticStore.fileType));
	}, [logisticStore.logisticVedOrderCurrent?.file, logisticStore.fileType, logisticStore.logisticVedOrderCurrent]);

	const tableData = {
		header: [
			{ key: 'file', label: 'Файл' },
			{ key: 'author', label: 'Автор' },
			{ key: 'comment', label: 'Комментарий' },
		],
		sortKeys: [],
		body: files.map((file) => {
			return {
				file: {
					output: (
						<div>
							<Tooltip
								label={'Скачать указанную версию файла'}
								withArrow
								openDelay={1000}
								transitionDuration={300}
							>
								<a
									href={`/api/static${file.url}`}
									download={`Заявка ВЭД (${
										logisticStore.logisticVedOrderCurrent?.author.firstName
									}) ${
										logisticStore.logisticVedOrderCurrent?.createdAt
											? format(
													parseISO(logisticStore.logisticVedOrderCurrent.createdAt),
													'yyyy-MM-dd'
											)
											: ''
									}`}
									className={css.file}
								>
									<Icon name="excel" /> скачать
								</a>
							</Tooltip>
							<TextField className={css.date} size="small">
								{formatDistance(parseISO(file.createdAt), new Date(), {
									locale: customLocaleRu,
									addSuffix: true,
								})}
							</TextField>
						</div>
					),
					index: 'file',
				},
				author: {
					output: file.author ? (
						<Menu
							width={225}
							offset={-20}
							control={
								<div className={css.staff}>
									<StaffAvatar size="small" user={file.author} />
									<TextField className={css.staff__text}>
										{file.author.lastName} {file.author.firstName}
									</TextField>
								</div>
							}
						>
							<MenuItemStaffUser data={file.author} />
						</Menu>
					) : null,
					index: file.author.lastName + file.author.firstName,
				},
				comment: {
					output: (
						<TextField size="small" className={css.comment}>
							{file.comment}
						</TextField>
					),
					index: file.comment,
				},
			};
		}),
	};

	return (
		<Modal
			title={logisticStore.fileType === 'order' ? 'История файлов заявки' : 'История файлов расчетов'}
			opened={logisticStore.modalOrderStage.fileHistory}
			onClose={() => logisticStore.setModalOrderStage('fileHistory', false)}
			size={800}
		>
			<Table data={tableData as TablePropsData} />
		</Modal>
	);
});
