import { Module } from '@nestjs/common';
import { UserController } from './infrastructure/user.controller';

@Module({
  controllers: [UserController],
})
export class UsersModule {}
