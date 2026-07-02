import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'Capital Partners LLC' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'capital-partners' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase alphanumeric with dashes' })
  slug: string;
}
