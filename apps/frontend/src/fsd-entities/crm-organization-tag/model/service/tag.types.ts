import { ITagEntity } from "../../tag.entity";

export interface ITagApiAdd {
	name: string;
}

export interface ITagApiEdit {
	id: string | number;
	updateDto: Partial<ITagApiAdd>
}

export interface ITagApiGet {
	where: Partial<Record<keyof ITagEntity, unknown>>;
	include?: Record<string, unknown>;
	filter?: Record<string, unknown>;
}
