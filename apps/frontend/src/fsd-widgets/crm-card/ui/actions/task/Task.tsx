import { FC } from "react";
import { Button, Icon, Tabs, Textarea } from "@fsd/shared/ui-kit";
import { ITaskListProps, ITaskPanelProps } from "./task.props";
import css from './task.module.scss';

export const TaskList: FC<ITaskListProps> = (
	{ index, disabled }
) => {
	return (
		<Tabs.Tab
			icon={<Icon name={'todo'} />} 
			value={index}
			disabled={disabled}
		> Задача </Tabs.Tab>
	);
}

export const TaskPanel: FC<ITaskPanelProps> = (
	{ index, disabled }
) => {

	return (
		<Tabs.Panel value={index} className={css.panel}>
			<div className={css.wrapper}>
				<Textarea
					label={'Комментарий'}
					className={css.comment}
					disabled={disabled}
				/>

				<Button
					color={'primary'}
					size={'large'}
					className={css.button}
					disabled={disabled}
				> Добавить </Button>
			</div>
		</Tabs.Panel>
	);
}
