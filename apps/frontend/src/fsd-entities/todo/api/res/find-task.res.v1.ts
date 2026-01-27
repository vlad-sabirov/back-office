import { ITaskEntity } from '@fsd/entities/todo/api/entities/task.entity';

export interface IFindTaskResponseV1 extends ITaskEntity {
	error?: string;
	data: ITaskEntity | null;
}

export interface IFindTasksResponseV1 extends ITaskEntity {
	error?: string;
	total: number;
	data: ITaskEntity[] | null;
}
