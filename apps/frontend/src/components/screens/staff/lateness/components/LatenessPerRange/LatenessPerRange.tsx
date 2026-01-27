import { FC, createContext, useContext, useEffect } from 'react';
import { Header } from './components';
import LatenessPerRangeStore from './lateness-per-range.store';
import { observer } from 'mobx-react-lite';
import { useRandom } from '@hooks';
import { useInterval } from '@mantine/hooks';
import { BodyLeft } from '@screens/staff/lateness/components/LatenessPerRange/components/BodyLeft';
import { BodyRight } from '@screens/staff/lateness/components/LatenessPerRange/components/BodyRight';
import { GetAllPerMonth } from '@screens/staff/lateness/data/getAllPerMonth';
import { LatenessPerRangeProps } from '.';
import css from './lateness-per-range.module.scss';

const latenessPerRangeStore = new LatenessPerRangeStore();
export const LatenessPerRangeContext = createContext(latenessPerRangeStore);

const Component: FC<LatenessPerRangeProps> = observer(({ className, ...props }) => {
	const componentContext = useContext(LatenessPerRangeContext);
	const random = useRandom();
	const interval = useInterval(() => getData(), random.calc(10000, 30000));

	const getData = () => {
		GetAllPerMonth.get(componentContext.date).then((res) => {
			if (!res) return;
			componentContext.setData(res);
			if (componentContext.current === null) return;
			const findCurrentUser = res.some((item) => item.user.id === componentContext.current?.user?.id);
			if (!findCurrentUser) {
				componentContext.setCurrent(null);
			}
			componentContext.setCurrent(
				res.find((item) => item.user.id === componentContext.current?.user?.id) || null
			);
		});
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line
	}, [componentContext.date, componentContext.refreshStamp]);

	useEffect(() => {
		interval.start();
		return interval.stop;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [random, interval]);

	return (
		<div className={className} {...props}>
			<Header date={componentContext.date} setDate={componentContext.setDate} onRefresh={getData} />

			<div className={css.body}>
				<BodyLeft data={componentContext.data} setCurrentLateness={componentContext.setCurrent} />
				<BodyRight data={componentContext.current} onSuccess={componentContext.getRefreshStamp} />
			</div>
		</div>
	);
});

const withHOC = <T extends LatenessPerRangeProps>(Component: FC<T>) => {
	return function withHOCComponent(props: T) {
		return (
			<LatenessPerRangeContext.Provider value={latenessPerRangeStore}>
				<Component {...props} />
			</LatenessPerRangeContext.Provider>
		);
	};
};

export const LatenessPerRange = withHOC(Component);
