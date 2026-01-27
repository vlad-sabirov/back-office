export interface SaveImageResize {
	width: number;
	height: number;
}

export class SaveImageDto {
	folder: string;
	filename?: string;
	resize?: SaveImageResize | number;
}
