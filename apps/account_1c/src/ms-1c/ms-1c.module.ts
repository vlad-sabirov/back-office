import { Module } from '@nestjs/common';
import { HttpModule } from '../http';
import { Ms1cService } from './ms-1c.service';

@Module({
	imports: [HttpModule],
	controllers: [],
	providers: [Ms1cService],
	exports: [Ms1cService],
})
export class Ms1cModule {}
