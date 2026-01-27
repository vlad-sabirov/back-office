import { ITaskEntity } from '@fsd/entities/todo/api/entities';

export interface ITaskProps {
	task: ITaskEntity;
	onClickToTask: () => void;
}
