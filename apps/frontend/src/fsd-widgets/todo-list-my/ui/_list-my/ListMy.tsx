import { FC, useMemo } from 'react';
import { endOfDay, isToday, parseISO, startOfDay, subDays } from 'date-fns';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Empty } from '@fsd/widgets/todo-list-my/ui/empty/Empty';
import { Group } from '../group/Group';
import { IListMyProps } from './list-my-props';
import css from './list-my.module.scss';

export const ListMy: FC<IListMyProps> = (props) => {
	const { onClickToTask } = props;
	const dataMy = useStateSelector((state) => state.todo.data.my);

	const dataToday = useMemo(() => {
		return dataMy ? dataMy.filter((task) => isToday(parseISO(task.due_date))) : [];
	}, [dataMy]);

	const dataOverdue = useMemo(() => {
		return dataMy.filter((task) => parseISO(task.due_date) <= endOfDay(subDays(startOfDay(new Date()), 1)));
	}, [dataMy]);

	return (
		<div className={css.root}>
			{dataToday.length > 0 && <Group title={'На сегодня'} tasks={dataToday} onClickToTask={onClickToTask} />}
			{dataOverdue.length > 0 && (
				<Group title={'Просроченные'} tasks={dataOverdue} onClickToTask={onClickToTask} />
			)}
			{!dataToday.length && !dataOverdue.length && <Empty />}
		</div>
	);
};
