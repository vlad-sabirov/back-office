import { Module } from '@nestjs/common';
import { HttpModule } from '../http';
import { MsCrmService } from './ms-crm.service';

@Module({
	imports: [HttpModule],
	controllers: [],
	providers: [MsCrmService],
	exports: [MsCrmService],
})
export class MsCrmModule {}
