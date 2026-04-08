export interface ICrmNoteEntity {
	id: number;
	text: string;
	organizationId: number;
	userId: number;
	user?: {
		id: number;
		firstName: string;
		lastName: string;
		photo?: string;
		color?: string;
	};
	createdAt: string;
	updatedAt: string;
}
