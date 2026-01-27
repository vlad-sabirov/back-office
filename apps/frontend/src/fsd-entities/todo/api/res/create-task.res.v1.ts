import { ITaskEntity } from '@fsd/entities/todo/api/entities/task.entity';

export interface ICreateTaskResponseV1 {
	data: ITaskEntity | null;
	error?: string;
}
