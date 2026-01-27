import { ITaskEntity } from '@fsd/entities/todo/api/entities/task.entity';

export interface IGetTasksResponseV1 extends ITaskEntity {
	error?: string;
	total: number;
	data: ITaskEntity[] | null;
}
