import { FC } from 'react';
import { TextField } from '@fsd/shared/ui-kit';
import css from './empty.module.scss';

export const Empty: FC = () => {
	return (
		<div>
			<TextField className={css.title}>Нет задач на сегодня</TextField>
			<TextField className={css.description}>Запланируйте задачу</TextField>
		</div>
	);
};
