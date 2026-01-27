import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { path } from 'app-root-path';
import { ensureDir, writeFile, remove, chmod } from 'fs-extra';
import { SaveImageResponse } from './dto/save-image.response';
import { SaveImageDto, SaveImageResize } from './dto/save-image.dto';
import * as sharp from 'sharp';
import { SaveFileDto } from './dto/save-file.dto';
import { SaveFileResponse } from './dto/save-file.response';

const fileNameMask = 'yyyy-MM-dd_hh-mm-ss-SSS';

@Injectable()
export class FileService {
	public async saveImage(file: Express.Multer.File, options: SaveImageDto): Promise<SaveImageResponse> {
		const fileName = options.filename ? options.filename : format(new Date(), fileNameMask) + '.webp';
		const pathFolder = path + '/uploads/' + options.folder + '/';

		await ensureDir(pathFolder);
		await writeFile(pathFolder + fileName, await this.convertToWebP(file.buffer, options.resize));
		await chmod(pathFolder, '777');
		await chmod(pathFolder + fileName, '777');

		return { url: `${options.folder}/${fileName}` };
	}

	saveFile = async (file: Express.Multer.File, options: SaveFileDto): Promise<SaveFileResponse> => {
		const formatFile = file.originalname.split('.').slice(-1);
		const fileName = options.filename ? options.filename : format(new Date(), fileNameMask) + `.${formatFile}`;

		const pathFolder = path + '/uploads/' + options.folder + '/';

		await ensureDir(pathFolder);
		await writeFile(pathFolder + fileName, file.buffer);
		await chmod(pathFolder, '777');
		await chmod(pathFolder + fileName, '777');

		return { url: `${options.folder}/${fileName}` };
	};

	private async convertToWebP(fileBuffer: Buffer, resize?: SaveImageResize | number): Promise<Buffer> {
		if (resize) {
			return typeof resize === 'object'
				? sharp(fileBuffer).resize(resize.width, resize.height).webp().toBuffer()
				: sharp(fileBuffer).resize(resize).webp().toBuffer();
		}

		return sharp(fileBuffer).webp().toBuffer();
	}

	public deleteFile = async (filePath: string) => {
		if (filePath !== '/uploads' && filePath !== '/uploads/') await remove(path + filePath);
	};
}
