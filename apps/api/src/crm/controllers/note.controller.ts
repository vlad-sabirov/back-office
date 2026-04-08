import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { NoteService } from '../services/note.service';
import { TokenService } from '../../auth/services/token.service';

@Controller('crm/note')
export class NoteController {
	constructor(
		private readonly noteService: NoteService,
		private readonly tokenService: TokenService,
	) {}

	private getUserId(authorization: string): number {
		const token = authorization?.replace('Bearer ', '');
		const payload = this.tokenService.validateAccessToken(token);
		return payload?.id;
	}

	@Post()
	async create(
		@Headers('authorization') authorization: string,
		@Body() body: { text: string; organizationId: number },
	) {
		const userId = this.getUserId(authorization);
		return this.noteService.create({
			text: body.text,
			organizationId: Number(body.organizationId),
			userId,
		});
	}

	@Get('/byOrganizationId/:id')
	async findByOrganizationId(@Param('id') id: string) {
		return this.noteService.findByOrganizationId(Number(id));
	}

	@Get('/lastByOrganizationId/:id')
	async getLastByOrganizationId(@Param('id') id: string) {
		return this.noteService.getLastByOrganizationId(Number(id));
	}

	@Patch('/byId/:id')
	async updateById(
		@Headers('authorization') authorization: string,
		@Param('id') id: string,
		@Body() body: { text: string },
	) {
		const userId = this.getUserId(authorization);
		return this.noteService.updateById({
			id: Number(id),
			text: body.text,
			currentUserId: userId,
		});
	}

	@Delete('/byId/:id')
	async deleteById(
		@Headers('authorization') authorization: string,
		@Param('id') id: string,
	) {
		const userId = this.getUserId(authorization);
		return this.noteService.deleteById({
			id: Number(id),
			currentUserId: userId,
		});
	}
}
