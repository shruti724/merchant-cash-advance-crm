import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateLeadDto {
  @ApiProperty({ example: 'Acme Bakery LLC' })
  @IsString()
  businessName: string;

  @ApiProperty({ example: 'John Smith' })
  @IsString()
  contactName: string;

  @ApiProperty({ example: 'john@acmebakery.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1-555-0100' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'referral' })
  @IsOptional()
  @IsString()
  source?: string;
}
