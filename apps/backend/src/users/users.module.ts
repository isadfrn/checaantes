import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { MailModule } from '../mail/mail.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    MailModule,
    StorageModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
