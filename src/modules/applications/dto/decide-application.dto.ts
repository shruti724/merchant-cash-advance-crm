import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class DecideApplicationDto {
  @ApiProperty({ enum: ['APPROVED', 'DECLINED'] })
  @IsIn(['APPROVED', 'DECLINED'])
  decision: 'APPROVED' | 'DECLINED';

  @ApiPropertyOptional({ description: 'Required when decision is DECLINED' })
  @IsOptional()
  @IsString()
  reason?: string;
}
