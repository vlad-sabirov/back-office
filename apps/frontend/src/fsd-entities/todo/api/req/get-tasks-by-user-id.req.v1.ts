import { ITaskEntity } from '@fsd/entities/todo/api/entities/task.entity';

export interface IGetTasksByUserIdRequestV1 {
	user_id: number;
	limit?: string;
	offset?: string;
	order?: {
		field: keyof ITaskEntity;
		direction: 'asc' | 'desc';
	}[];
}
