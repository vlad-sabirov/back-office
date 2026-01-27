import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SaveFileDto } from './dto/save-file.dto';
import { SaveFileResponse } from './dto/save-file.response';
import { SaveImageDto } from './dto/save-image.dto';
import { SaveImageResponse } from './dto/save-image.response';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
	constructor(private readonly fileService: FileService) {}

	@Post('/image/')
	@UseInterceptors(FileInterceptor('file'))
	async saveImage(
		@UploadedFile() file: Express.Multer.File,
		@Body() options: SaveImageDto
	): Promise<SaveImageResponse> {
		return await this.fileService.saveImage(file, options);
	}

	@Post('/file/')
	@UseInterceptors(FileInterceptor('file'))
	async saveFile(@UploadedFile() file: Express.Multer.File, @Body() options: SaveFileDto): Promise<SaveFileResponse> {
		return await this.fileService.saveImage(file, options);
	}

	@Post('/deleteFile/')
	async deleteFile(@Body('filePath') filePath: string) {
		await this.fileService.deleteFile(filePath);
	}
}
