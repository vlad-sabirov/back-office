export interface IFormOrgOrContProps {
	value: IFormOrgOrContSearchResponse | null;
	onChange: (val: IFormOrgOrContSearchResponse | null) => void;
	error: string;
	setError: (val: string | null) => void;
	setTitle?: (val: string) => void;
}

export interface IFormOrgOrContSearchResponse {
	id: number;
	type: 'organization' | 'contact';
	name: string;
	description: string[];
	phones: string[];
}

export interface IFormOrgOrContValidation {
	value: IFormOrgOrContSearchResponse | null;
	setError: (val: string | null) => void;
	required?: boolean;
}
