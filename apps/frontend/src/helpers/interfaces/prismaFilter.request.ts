export interface PrismaFilterRequest<T> {
	// eslint-disable-next-line no-unused-vars
	orderBy?: { [key in keyof Partial<T>]: 'asc' | 'desc' } | { [key in keyof Partial<T>]: 'asc' | 'desc' }[];
	take?: number;
	skip?: number;
}
