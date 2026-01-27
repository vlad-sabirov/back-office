import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UserTerritoryEntity } from '../entity/user-territory.entity';

export class CreateTerritoryDto {
	@ValidateNested()
	@Type(() => UserTerritoryEntity)
	territoryDto: UserTerritoryEntity;
}
