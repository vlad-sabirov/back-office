import { CombiningType } from '../../helpers';

export interface QueryTaskDto {
	id?: CombiningType<number | string>;
	title?: CombiningType<string>;
	status?: CombiningType<string | string[]>;
	priority?: CombiningType<string | string[]>;
	authorId?: CombiningType<number | string>;
	assigneeId?: CombiningType<number | string>;
	organizationId?: CombiningType<number | string>;
	deadline?: CombiningType<Date | string>;
	reminderSent3Days?: CombiningType<boolean>;
	reminderSent1Day?: CombiningType<boolean>;
	reminderSent2Hours?: CombiningType<boolean>;
	overdueNotified?: CombiningType<boolean>;
	createdAt?: CombiningType<Date | string>;
}
