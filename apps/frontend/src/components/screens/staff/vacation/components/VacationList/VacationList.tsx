import { FC, useEffect, useState } from 'react';
import { VacationListSkeleton } from './vacation-list.skeleton';
import { differenceInDays, format, parseISO } from 'date-fns';
import { ContentBlock, Icon, Menu, Table, TextField } from '@fsd/shared/ui-kit';
import { customLocaleRu } from '@config/date-fns.locale';
import { DateSuffix } from '@helpers/DateSuffix';
import { Tooltip } from '@mantine/core';
import { StaffUserWithAvatar } from '@screens/staff/shared';
import { VacationResponse } from '../../interfaces';
import { VacationDeleteModal, VacationEditModal } from '../../modals';
import { VacationListProps } from '.';
import css from './vacation-list.module.scss';

export const VacationList: FC<VacationListProps> = ({ data, ...props }) => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [modalEditIsOpened, setModalEditIsOpened] = useState<boolean>(false);
	const [modalDeleteIsOpened, setModalDeleteIsOpened] = useState<boolean>(false);
	const [currentVacation, setCurrentVacation] = useState<VacationResponse>();

	useEffect(() => {
		if (data && data.length) setIsLoading(false);
	}, [data]);

	const tableData = {
		header: [
			{ key: 'user', label: 'Сотрудник' },
			{ key: 'dateStart', label: 'Начало' },
			{ key: 'dateEnd', label: 'Конец' },
			{ key: 'amountOfDay', label: 'Дней отпуска' },
		],
		sortKeys: ['dateStart', 'user', 'dateEnd'],
		body: data
			? data.map((vacation) => {
					const user = vacation.user ? (
						<div className={css.user}>
							<StaffUserWithAvatar
								user={vacation.user}
								menuItems={
									<>
										<Menu.Divider />

										<Menu.Item
											color={'blue'}
											icon={<Icon name="edit" />}
											onClick={() => {
												setModalEditIsOpened(true);
												setCurrentVacation(vacation);
											}}
										>
											Изменить
										</Menu.Item>

										<Menu.Item
											color={'red'}
											icon={<Icon name="trash" />}
											onClick={() => {
												setModalDeleteIsOpened(true);
												setCurrentVacation(vacation);
											}}
										>
											Удалить
										</Menu.Item>
									</>
								}
							/>

							{vacation.isFake && (
								<Tooltip
									label={'Не настоящий отпуск'}
									multiline
									withArrow
									openDelay={300}
									transitionDuration={300}
								>
									<div>
										<Icon name="fired" />
									</div>
								</Tooltip>
							)}

							{!!vacation.comment && (
								<Tooltip
									label={vacation.comment}
									multiline
									withArrow
									openDelay={300}
									transitionDuration={300}
								>
									<div>
										<Icon name="comment" />
									</div>
								</Tooltip>
							)}
						</div>
					) : (
						<></>
					);

					const dateStart = {
						display: format(parseISO(vacation.dateStart), 'd MMMM yyyy', { locale: customLocaleRu }),
						short: format(parseISO(vacation.dateStart), 'yyyyMMdd', { locale: customLocaleRu }),
					};

					const dateEnd = {
						display: format(parseISO(vacation.dateEnd), 'd MMMM yyyy', { locale: customLocaleRu }),
						short: format(parseISO(vacation.dateEnd), 'yyyyMMdd', { locale: customLocaleRu }),
					};

					const amountOfDay = differenceInDays(parseISO(vacation.dateEnd), parseISO(vacation.dateStart)) + 1;

					return {
						user: { output: user, index: `${vacation.user?.lastName}${vacation.user?.firstName}` },

						dateStart: {
							output: <TextField className={css.dateStart}>{dateStart.display}</TextField>,
							index: dateStart.short,
						},

						dateEnd: {
							output: <TextField className={css.dateEnd}>{dateEnd.display}</TextField>,
							index: dateEnd.short,
						},

						amountOfDay: {
							output: (
								<TextField className={css.dateEnd}>
									{amountOfDay} {DateSuffix(amountOfDay, ['день', 'дня', ' дней'])}
								</TextField>
							),
							index: amountOfDay,
						},
					};
				})
			: undefined,
	};

	return !isLoading ? (
		<div className={css.wrapper} {...props}>
			<ContentBlock withoutPaddingX>
				<Table data={tableData} />
			</ContentBlock>

			<VacationEditModal data={currentVacation} opened={modalEditIsOpened} setOpened={setModalEditIsOpened} />
			<VacationDeleteModal
				data={currentVacation}
				opened={modalDeleteIsOpened}
				setOpened={setModalDeleteIsOpened}
			/>
		</div>
	) : (
		<VacationListSkeleton />
	);
};
