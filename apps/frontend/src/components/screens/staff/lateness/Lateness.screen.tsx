import { FC, createContext, useContext, useEffect, useState } from 'react';
import { LatenessPerDay, LatenessPerRange, LeftSection, RightSection } from './components';
import { GetAllToday } from './data';
import LatenessStore from './lateness.store';
import { getTime } from 'date-fns';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { HeaderContent } from '@components/HeaderContent/HeaderContent';
import { Error403 } from '@components/errors';
import { LatenessAccess } from '@fsd/entities/lateness';
import { ContentBlock } from '@fsd/shared/ui-kit';
import { useAccess, useRandom } from '@hooks';
import { LatenessDataResponse } from '@interfaces/lateness';
import { useInterval } from '@mantine/hooks';
import { LatenessProps } from '.';

const latenessStore = new LatenessStore();
export const LatenessContext = createContext(latenessStore);

const withHOC = <T extends LatenessProps>(Component: FC<T>) => {
	return function withHOCComponent(props: T) {
		return (
			<LatenessContext.Provider value={latenessStore}>
				<Component {...props} />
			</LatenessContext.Provider>
		);
	};
};

const Component: FC<LatenessProps> = observer(({ className, ...props }) => {
	const latenessStore = useContext(LatenessContext);
	const CheckAccess = useAccess();
	const [dataPerDay, setDataPerDay] = useState<LatenessDataResponse[]>([]);
	const random = useRandom();
	const interval = useInterval(() => getData(), random.calc(5000, 20000));

	const getData = () => {
		GetAllToday.get(latenessStore.dateSingle).then((res) => {
			setDataPerDay(res);
		});
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => getData(), [latenessStore.dateSingle, latenessStore.dateSingleRefreshStamp]);

	useEffect(() => {
		interval.start();
		return interval.stop;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [random, interval]);

	return CheckAccess(LatenessAccess.lateness) ? (
		<>
			<Head>
				<title>Статистика посещаемости</title>
			</Head>

			<div className={className} {...props}>
				<HeaderContent
					title="Статистика посещаемости"
					leftSection={<LeftSection />}
					rightSection={<RightSection />}
				/>

				<ContentBlock>
					<LatenessPerDay
						data={dataPerDay}
						date={latenessStore.dateSingle}
						onSuccess={() => {
							latenessStore.setDateSingleRefreshStamp(getTime(new Date()));
						}}
					/>
				</ContentBlock>

				<LatenessPerRange />
			</div>
		</>
	) : (
		<Error403 />
	);
});

export const LatenessScreen = withHOC(Component);
