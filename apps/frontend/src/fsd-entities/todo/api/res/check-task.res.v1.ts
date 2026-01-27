import { ITaskEntity } from '@fsd/entities/todo/api/entities/task.entity';

export interface ICheckTaskResponseV1 {
	data: ITaskEntity | null;
	error?: string;
}
