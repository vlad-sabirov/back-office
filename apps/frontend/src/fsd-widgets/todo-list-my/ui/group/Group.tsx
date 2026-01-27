import { FC } from 'react';
import { TextField } from '@fsd/shared/ui-kit';
import { IGroupProps } from '@fsd/widgets/todo-list-my/ui/group/group.props';
import { Task } from '@fsd/widgets/todo-list-my/ui/task/Task';
import css from 'fsd-widgets/todo-list-my/ui/group/group.module.scss';

export const Group: FC<IGroupProps> = (props) => {
	const { title, tasks, onClickToTask } = props;

	return (
		<>
			<div>
				<TextField className={css.title}>
					{title} <span>{tasks.length}</span>
				</TextField>

				<div className={css.tasks}>
					{tasks.map((task) => (
						<Task task={task} key={task.id} onClickToTask={onClickToTask} />
					))}
				</div>
			</div>
		</>
	);
};
