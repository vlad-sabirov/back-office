import { ITaskEntity } from '@fsd/entities/todo/api/entities/task.entity';

export interface IFindTaskRequestV1 {
	fields: Partial<ITaskEntity>;
	order?: {
		field: keyof ITaskEntity;
		direction: 'asc' | 'desc';
	}[];
}

export interface IFindTasksRequestV1 {
	fields: Partial<ITaskEntity>;
	limit?: number;
	offset?: number;
	order?: {
		field: keyof ITaskEntity;
		direction: 'asc' | 'desc';
	}[];
}
