export interface IRequisiteApiFindOnce {
	where: {
		id?: number | string;
		name?: string;
		inn?: number | string;
		code1c?: string;
		organizationId?: number | string;
		createdAt?: string;
		updatedAt?: string;
	};
	include?: {
		organizations?: unknown;
	};
}

export interface IRequisiteApiCreate {
	name: string;
	inn?: string | number;
	code1c: string;
	organizationId: string | number;
}

export type IRequisiteApiUpdate = {
	id: string | number;
} & Partial<IRequisiteApiCreate>;
