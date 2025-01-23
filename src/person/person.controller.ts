import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PersonService } from './person.service';
import { AuthUser } from 'src/_utils/decorators/auth-user.decorator';
import { User } from 'src/_entity/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guard/jwt-auth.guard';
import {
  CreatePersonDto,
  QueryFindAllPerson,
  UpdatePersonDto,
} from './dto/person.dto';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { responseSuccess } from 'src/_utils/decorators/api-response.decorator';

@ApiTags('Person')
@UseGuards(JwtAuthenticationGuard)
@ApiBearerAuth('access-token')
@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get('find/all')
  async findAll(
    @AuthUser() user: User,
    @Query() query: QueryFindAllPerson,
    @Res() res: Response,
  ) {
    return res
      .status(StatusCodes.OK)
      .send(
        responseSuccess(await this.personService.findAllByUser(user, query)),
      );
  }

  @Get('find/one/:id_person')
  async findOne(@Param('id_person') id_person: number, @Res() res: Response) {
    return res
      .status(StatusCodes.OK)
      .send(responseSuccess(await this.personService.findOne(id_person)));
  }

  @Post()
  async created(
    @AuthUser() user: User,
    @Body() body: CreatePersonDto,
    @Res() res: Response,
  ) {
    return res
      .status(StatusCodes.OK)
      .send(
        responseSuccess(await this.personService.upsert(undefined, body, user)),
      );
  }

  @Patch(':id_person')
  async update(
    @Param('id_person') id_person: number,
    @Body() body: UpdatePersonDto,
    @AuthUser() user: User,
    @Res() res: Response,
  ) {
    return res
      .status(StatusCodes.OK)
      .send(
        responseSuccess(await this.personService.upsert(id_person, body, user)),
      );
  }

  @Delete(':id_person')
  async remove(
    @AuthUser() user: User,
    @Param('id_person') id_person: number,
    @Res() res: Response,
  ) {
    return res
      .status(StatusCodes.OK)
      .send(responseSuccess(await this.personService.remove(id_person, user)));
  }
}
