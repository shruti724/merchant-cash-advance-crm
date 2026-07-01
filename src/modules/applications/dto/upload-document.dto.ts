import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export enum DocumentTypeDto {
  BANK_STATEMENT = 'BANK_STATEMENT',
  ID_VERIFICATION = 'ID_VERIFICATION',
  BUSINESS_LICENSE = 'BUSINESS_LICENSE',
  OTHER = 'OTHER',
}

export class UploadDocumentDto {
  @ApiProperty({ enum: DocumentTypeDto })
  @IsEnum(DocumentTypeDto)
  type: DocumentTypeDto;

  @ApiProperty({ example: 'bank-statement-jan.pdf' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 's3://tenant-bucket/applications/123/bank-statement-jan.pdf' })
  @IsString()
  storageKey: string;
}
