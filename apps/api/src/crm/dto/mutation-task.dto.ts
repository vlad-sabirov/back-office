export interface MutationTaskDto {
	title: string;
	description?: string;
	status?: string;
	priority?: string;
	deadline?: string | Date | null;
	authorId: number | string;
	assigneeId: number | string;
	organizationId?: number | string;
}
