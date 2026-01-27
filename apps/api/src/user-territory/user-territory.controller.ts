import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Patch,
	Post,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { CreateTerritoryDto } from './dto/create-territory.dto';
import { ResortTerritoryDto } from './dto/resort-territory.dto';
import { UpdateTerritoryDto } from './dto/update-territory.dto';
import { UserTerritoryEntity } from './entity/user-territory.entity';
import { UserTerritoryConstants } from './user-territory.constants';
import { UserTerritoryService } from './user-territory.service';

@Controller('user-territory')
export class UserTerritoryController {
	constructor(private readonly userTerritoryService: UserTerritoryService) {}

	@Post('/')
	@UsePipes(new ValidationPipe())
	async create(@Body() dto: CreateTerritoryDto): Promise<UserTerritoryEntity> {
		const findDuplicateName = await this.userTerritoryService.findByName(dto.territoryDto.name);
		if (findDuplicateName)
			throw new HttpException(UserTerritoryConstants.ERROR_NAME_DUPLICATE, HttpStatus.BAD_REQUEST);

		const findDuplicateAddress = await this.userTerritoryService.findByAddress(dto.territoryDto.address);
		if (findDuplicateAddress)
			throw new HttpException(UserTerritoryConstants.ERROR_ADDRESS_DUPLICATE, HttpStatus.BAD_REQUEST);

		return await this.userTerritoryService.create(dto);
	}

	@Get('/')
	async findAll(): Promise<UserTerritoryEntity[]> {
		return this.userTerritoryService.findAll();
	}

	@Get('/byId/:id')
	async findById(@Param('id') id: number): Promise<UserTerritoryEntity> {
		const findTerritory = await this.userTerritoryService.findById(id);
		if (!findTerritory) throw new HttpException(UserTerritoryConstants.ERROR_ID_NOTFOUND, HttpStatus.NOT_FOUND);

		return findTerritory;
	}

	@Get('/byName/:name')
	async findByName(@Param('name') name: string): Promise<UserTerritoryEntity> {
		const findTerritory = await this.userTerritoryService.findByName(name);
		if (!findTerritory) throw new HttpException(UserTerritoryConstants.ERROR_NAME_NOT_FOUND, HttpStatus.NOT_FOUND);

		return findTerritory;
	}

	@UsePipes(new ValidationPipe())
	@Patch('/byId/:id')
	async updateTerritory(@Param('id') id: number, @Body() dto: UpdateTerritoryDto): Promise<UserTerritoryEntity> {
		const findTerritory = await this.userTerritoryService.findById(id);
		if (!findTerritory) throw new HttpException(UserTerritoryConstants.ERROR_ID_NOTFOUND, HttpStatus.NOT_FOUND);

		const findDuplicateName = await this.userTerritoryService.findByName(dto.territoryDto.name);

		if (findDuplicateName && findTerritory.id !== findDuplicateName.id)
			throw new HttpException(UserTerritoryConstants.ERROR_NAME_DUPLICATE, HttpStatus.BAD_REQUEST);

		const findDuplicateAddress = await this.userTerritoryService.findByAddress(dto.territoryDto.address);
		if (findDuplicateAddress && findTerritory.id !== findDuplicateAddress.id)
			throw new HttpException(UserTerritoryConstants.ERROR_ADDRESS_DUPLICATE, HttpStatus.BAD_REQUEST);

		return await this.userTerritoryService.updateById(id, dto);
	}

	@Patch('/resort')
	async resort(@Body() dto: ResortTerritoryDto[]): Promise<void> {
		return await this.userTerritoryService.resort(dto);
	}

	@Delete('/byId/:id')
	async deleteById(@Param('id') id: number): Promise<UserTerritoryEntity> {
		const findTerritory = await this.userTerritoryService.findById(id);
		if (!findTerritory) throw new HttpException(UserTerritoryConstants.ERROR_ID_NOTFOUND, HttpStatus.NOT_FOUND);

		return await this.userTerritoryService.deleteById(id);
	}
}
