import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StorageService } from './storage.service';

@ApiTags('storage')
@ApiBearerAuth()
@Controller('v1/storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Get('presign')
  presign(@Query('key') key: string, @Query('contentType') contentType: string) {
    return this.storage.presign(key, contentType);
  }
}
