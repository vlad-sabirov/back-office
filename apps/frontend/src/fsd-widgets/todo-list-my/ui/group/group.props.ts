import { ITaskEntity } from '@fsd/entities/todo/api/entities';

export interface IGroupProps {
	title: string;
	tasks: ITaskEntity[];
	onClickToTask: () => void;
}
