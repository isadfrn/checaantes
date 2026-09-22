import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ChangeEmailDto } from './dto/change-email.dto.js';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

interface UploadedImage {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retorna o perfil do usuário logado' })
  getMe(@CurrentUser('sub') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualiza nome e/ou telefone do usuário logado' })
  updateMe(@CurrentUser('sub') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Troca a senha (exige a senha atual)' })
  changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  @Patch('me/email')
  @ApiOperation({
    summary: 'Solicita troca de e-mail (novo e-mail passa por reconfirmação)',
  })
  changeEmail(@CurrentUser('sub') userId: string, @Body() dto: ChangeEmailDto) {
    return this.usersService.requestEmailChange(userId, dto);
  }

  @Post('me/avatar')
  @ApiOperation({ summary: 'Envia a imagem de perfil (png/jpg/webp/gif, até 5 MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @CurrentUser('sub') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_AVATAR_SIZE }),
          new FileTypeValidator({ fileType: /^image\/(png|jpe?g|webp|gif)$/ }),
        ],
      }),
    )
    file: UploadedImage,
  ) {
    return this.usersService.updateAvatar(userId, {
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });
  }
}
