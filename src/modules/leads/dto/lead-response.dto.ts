import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus } from '../domain/lead-status.enum';

export class LeadResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() businessName: string;
  @ApiProperty() contactName: string;
  @ApiProperty() email: string;
  @ApiProperty() phone: string;
  @ApiProperty({ enum: LeadStatus }) status: LeadStatus;
  @ApiProperty({ required: false }) source?: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
