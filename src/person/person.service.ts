import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CreatePersonDto,
  QueryFindAllPerson,
  UpdatePersonDto,
} from './dto/person.dto';
import { User } from 'src/_entity/user.entity';
import { Person } from 'src/_entity/person.entity';
import { CommonStatus } from 'src/_enum/common.status';
import {
  BaseResponseDto,
  responseSuccess,
} from 'src/_utils/decorators/api-response.decorator';
import { PaginateQuery } from 'src/_utils/decorators/paginate-query.decorator';
import { IPaginationMeta, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class PersonService {
  constructor(private connection: DataSource) {}

  async upsert(
    id_person: number,
    body: CreatePersonDto | UpdatePersonDto,
    user: User,
  ): Promise<boolean> {
    try {
      if (id_person) {
        const exits = await this.connection
          .getRepository(Person)
          .findOneBy({ id_person: id_person, status: CommonStatus.ACTIVE });
        if (!exits) throw new NotFoundException();
        await this.connection
          .getRepository(Person)
          .update(
            { id_person: id_person },
            { modified_date: new Date(), modified_id: user?.id_user, ...body },
          );
      } else {
        const create = this.connection.getRepository(Person).create(body);
        create.created_date = new Date();
        create.modified_date = new Date();
        create.created_id = user?.id_user;
        create.modified_id = user?.id_user;
        create.id_user = user?.id_user;
        await this.connection.getRepository(Person).save(create);
      }
      return true;
    } catch (err: unknown) {
      console.log(err);
      if (err) throw err;
      throw new InternalServerErrorException();
    }
  }

  async remove(id_person: number, user: User): Promise<boolean> {
    try {
      const exits = await this.connection
        .getRepository(Person)
        .findOneBy({ id_person: id_person, status: CommonStatus.ACTIVE });
      if (!exits) throw new NotFoundException();
      await this.connection.getRepository(Person).update(
        { id_person: id_person },
        {
          status: CommonStatus.DELETED,
          modified_date: new Date(),
          modified_id: user?.id_user,
        },
      );
      return true;
    } catch (err: unknown) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async findAllByUser(
    user: User,
    query: QueryFindAllPerson,
  ): Promise<Pagination<Person, IPaginationMeta>> {
    const qb = this.connection
      .getRepository(Person)
      .createQueryBuilder('p')
      .where('p.id_user = :idu')
      .andWhere('p.status = :ac');

    qb.setParameters({
      idu: user?.id_user,
      ac: CommonStatus.ACTIVE,
      search: '%search%',
    });

    const res = await paginate(qb, {
      limit: query?.limit,
      page: query?.page,
    });

    return res;
  }

  async findOne(id_person: number): Promise<Person> {
    const res = await this.connection.getRepository(Person).findOneBy({
      id_person: id_person,
    });
    return res;
  }
}
