import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { KnowledgeBaseRecord } from './chatbot.repository';
import { KnowledgeBaseQueryDto, KnowledgeBaseWriteDto } from './dto/knowledge-base.dto';
import { KnowledgeBaseService } from './knowledge-base.service';

@Controller('admin/knowledge-base')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Get()
  async list(@Query() query: KnowledgeBaseQueryDto): Promise<{ message: string; payload: { items: KnowledgeBaseRecord[]; meta: unknown } }> {
    return { message: 'Knowledge items retrieved', payload: await this.knowledgeBaseService.list(query) };
  }

  @Post()
  async create(@Body() knowledgeDto: KnowledgeBaseWriteDto): Promise<{ message: string; payload: KnowledgeBaseRecord }> {
    return { message: 'Knowledge item created', payload: await this.knowledgeBaseService.create(knowledgeDto) };
  }

  @Get(':id')
  async read(@Param('id') id: string): Promise<{ message: string; payload: KnowledgeBaseRecord }> {
    return { message: 'Knowledge item retrieved', payload: await this.knowledgeBaseService.read(id) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() knowledgeDto: KnowledgeBaseWriteDto): Promise<{ message: string; payload: KnowledgeBaseRecord }> {
    return { message: 'Knowledge item updated', payload: await this.knowledgeBaseService.update(id, knowledgeDto) };
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string; payload: { deleted: true } }> {
    return { message: 'Knowledge item deleted', payload: await this.knowledgeBaseService.delete(id) };
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string): Promise<{ message: string; payload: KnowledgeBaseRecord }> {
    return { message: 'Knowledge item activated', payload: await this.knowledgeBaseService.activate(id) };
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string): Promise<{ message: string; payload: KnowledgeBaseRecord }> {
    return { message: 'Knowledge item archived', payload: await this.knowledgeBaseService.archive(id) };
  }
}
