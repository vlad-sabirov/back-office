import { showNotification } from '@mantine/notifications';
import { RealizationService } from '../../api/realization-api';
import { useActions } from '../use-actions/use-actions';

export const useBuildMonth = () => {
	const [buildFetch] = RealizationService.buildMonthByDate();
	const [getAllFetch] = RealizationService.getMonthAll();
	const actions = useActions();

	return async ({ year, month }: { year: number | string; month: number | string }) => {
		actions.setIsLoading(true);
		const resBuild = await buildFetch({ year, month });
		if ('error' in resBuild) {
			showNotification({
				color: 'red',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				message: resBuild.error.data.message,
			});
			actions.setIsLoading(false);
			return;
		}

		const resAll = await getAllFetch();
		if ('error' in resAll) {
			// noinspection JSUnresolvedReference
			showNotification({
				color: 'red',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				message: resAll.error.data.message,
			});
			actions.setIsLoading(false);
			return;
		}

		showNotification({
			color: 'green',
			message: 'Отчет собран, данные обновлены',
		});
		actions.setIsLoading(false);
	};
};
