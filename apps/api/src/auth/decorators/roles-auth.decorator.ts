import { SetMetadata } from '@nestjs/common';

export const Access = (...roles: string[]) => SetMetadata('access', roles);
