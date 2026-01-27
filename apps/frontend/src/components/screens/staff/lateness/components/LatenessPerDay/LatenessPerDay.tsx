import { FC, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Holiday } from './Holiday';
import { Item } from './Item';
import LatenessPerDayStore from './lateness-per-day.store';
import cn from 'classnames';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { orderBy } from 'lodash';
import { observer } from 'mobx-react-lite';
import { customLocaleRu } from '@config/date-fns.locale';
import TailwindColors from '@config/tailwind/color';
import { LatenessDataResponse } from '@interfaces/lateness';
import { Progress } from '@mantine/core';
import { ArrivedPerDayModal, DidComePerDayModal, LatePerDayModal } from '@screens/staff/lateness';
import { SubCommentAddModal, SubCommentDeleteModal, SubCommentEditModal } from '@screens/staff/lateness';
import { CommentEditModal, SetSkippedLatenessModal } from '@screens/staff/lateness';
import ProductionCalendarService from '@screens/staff/production-calendar/ProductionCalendar.service';
import { LatenessPerDayProps } from '.';
import css from './lateness-per-day.module.scss';

const latenessPerDayStore = new LatenessPerDayStore();
export const LatenessPerDayContext = createContext(latenessPerDayStore);

export const Component: FC<LatenessPerDayProps> = observer(({ data, date, className, onSuccess, ...props }) => {
	const componentStore = useContext(LatenessPerDayContext);
	const [arrived, setArrived] = useState<LatenessDataResponse[]>([]);
	const [late, setLate] = useState<LatenessDataResponse[]>([]);
	const [didCome, setDidCome] = useState<LatenessDataResponse[]>([]);
	const [isHoliday, setIsHoliday] = useState<boolean>(false);

	useEffect(() => {
		const arrivedTemp: LatenessDataResponse[] = [];
		const lateTemp: LatenessDataResponse[] = [];
		const didComeTemp: LatenessDataResponse[] = [];

		data.forEach((dataItem) => {
			if (dataItem.data[0].type === 'arrived') arrivedTemp.push(dataItem);
			if (dataItem.data[0].type === 'late') lateTemp.push(dataItem);
			if (dataItem.data[0].type === 'didCome') didComeTemp.push(dataItem);
		});

		setArrived(orderBy(arrivedTemp, [(item) => item.data[0].id], ['asc']));
		setLate(orderBy(lateTemp, [(item) => item.data[0].id], ['desc']));
		setDidCome(orderBy(didComeTemp, [(item) => item.user.lastLogin], ['asc']));
	}, [data]);

	useEffect(() => {
		let isMounted = true;

		(async () => {
			const [holidays] = await ProductionCalendarService.findBetweenDateRange({
				start: date,
				end: date,
			});
			if (isMounted) setIsHoliday(!!holidays?.length);
		})();

		return () => {
			isMounted = false;
		};
	}, [date]);

	const displayProgress = useMemo(() => {
		const countAll = arrived.length + late.length + didCome.length;

		return [
			{ value: (arrived.length / countAll) * 100, color: TailwindColors.success.main },
			{ value: (late.length / countAll) * 100, color: TailwindColors.warning.main },
			{ value: (didCome.length / countAll) * 100, color: TailwindColors.error.main },
		];
	}, [arrived, late, didCome]);

	return isHoliday ? (
		<Holiday data={data} date={date} className={className} {...props} />
	) : (
		<div className={cn(css.root, className)} {...props}>
			<div className={css.wrapper}>
				<Item
					title={arrived.length > 1 ? 'Пришли вовремя' : 'Пришел вовремя'}
					subtitle={arrived?.[0]?.user.sex === 'female' ? 'Раньше всех пришла' : 'Раньше всех пришел'}
					data={arrived}
					displayTime={'Время захода: ' + arrived?.[0]?.data?.[0]?.time}
					onClick={() => componentStore.setModalArrivedIsOpen(true)}
				/>

				<Item
					title={late.length > 1 ? 'Опоздали' : 'Опоздал'}
					subtitle={late?.[0]?.user.sex === 'female' ? 'Позже всех пришла' : 'Позже всех пришел'}
					data={late}
					displayTime={'Время захода: ' + late?.[0]?.data?.[0]?.time}
					onClick={() => componentStore.setModalLateIsOpen(true)}
				/>

				<Item
					title={didCome.length > 1 ? 'Не пришли' : 'Не пришел'}
					subtitle={'Дольше всех отсутствует'}
					data={didCome}
					displayTime={
						didCome?.[0]?.user?.lastLogin
							? 'Последний визит ' +
								formatDistanceToNow(parseISO(didCome?.[0]?.user?.lastLogin), {
										locale: customLocaleRu,
										addSuffix: true,
								})
							: ''
					}
					onClick={() => componentStore.setModalDidComeIsOpen(true)}
				/>
			</div>

			<Progress size="md" radius={'xl'} sections={displayProgress} className={css.progress} />

			{/*Модальные окна*/}
			<ArrivedPerDayModal
				data={arrived}
				isOpen={componentStore.modalArrivedIsOpen}
				setOpen={componentStore.setModalArrivedIsOpen}
			/>

			<LatePerDayModal
				data={late}
				isOpen={componentStore.modalLateIsOpen}
				setOpen={componentStore.setModalLateIsOpen}
			/>

			<DidComePerDayModal
				date={date}
				data={didCome}
				isOpen={componentStore.modalDidComeIsOpen}
				setOpen={componentStore.setModalDidComeIsOpen}
			/>

			{!!componentStore.currentLateness && (
				<CommentEditModal
					data={componentStore.currentLateness}
					isOpen={componentStore.modalCommentEditIsOpen}
					setOpen={componentStore.setModalCommentEditIsOpen}
					onSuccess={onSuccess}
				/>
			)}

			{!!componentStore.currentLateness && (
				<SetSkippedLatenessModal
					data={componentStore.currentLateness}
					isOpen={componentStore.modalSetSkippedIsOpen}
					setOpen={componentStore.setModalSetSkippedIsOpen}
					onSuccess={onSuccess}
				/>
			)}

			{!!componentStore.currentLateness && (
				<SubCommentAddModal
					isOpen={componentStore.modalSubCommentAddIsOpen}
					setOpen={componentStore.setModalSubCommentAddIsOpen}
					data={componentStore.currentLateness}
					onSuccess={onSuccess}
				/>
			)}

			{!!componentStore.currentLateness && (
				<SubCommentEditModal
					data={componentStore.currentLateness}
					commentID={componentStore.modalSubCommentID}
					isOpen={componentStore.modalSubCommentEditIsOpen}
					setOpen={componentStore.setModalSubCommentEditIsOpen}
					onSuccess={onSuccess}
				/>
			)}

			{!!componentStore.currentLateness && (
				<SubCommentDeleteModal
					data={componentStore.currentLateness}
					commentID={componentStore.modalSubCommentID}
					isOpen={componentStore.modalSubCommentDeleteIsOpen}
					setOpen={componentStore.setModalSubCommentDeleteIsOpen}
					onSuccess={onSuccess}
				/>
			)}
		</div>
	);
});

const withHOC = <T extends LatenessPerDayProps>(Component: FC<T>) => {
	return function withHOCComponent(props: T) {
		return (
			<LatenessPerDayContext.Provider value={latenessPerDayStore}>
				<Component {...props} />
			</LatenessPerDayContext.Provider>
		);
	};
};

export const LatenessPerDay = withHOC(Component);
