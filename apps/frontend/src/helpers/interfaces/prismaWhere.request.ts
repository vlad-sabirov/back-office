export type CombiningType<T> =
	| T
	| { lt?: T }
	| { lte?: T }
	| { gt?: T }
	| { gte?: T }
	| { equals?: T }
	| { not?: T }
	| { contains?: T }
	| { startsWith?: T }
	| { endsWith?: T }
	| { in?: T }
	| { notIn?: T };

type CombiningInterface<T> = {
	[P in keyof T]: T[P];
};

export interface PrismaWhereRequest<T> {
	OR?: CombiningInterface<Omit<T, 'OR' | 'AND' | 'NOT'>> | CombiningInterface<Omit<T, 'OR' | 'AND' | 'NOT'>>[];
	AND?: CombiningInterface<Omit<T, 'OR' | 'AND' | 'NOT'>> | CombiningInterface<Omit<T, 'OR' | 'AND' | 'NOT'>>[];
	NOT?: CombiningInterface<Omit<T, 'OR' | 'AND' | 'NOT'>> | CombiningInterface<Omit<T, 'OR' | 'AND' | 'NOT'>>[];
}
