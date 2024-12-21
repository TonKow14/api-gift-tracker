import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { responseSuccess } from 'src/_utils/decorators/api-response.decorator';
import { Brackets, DataSource } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/_entity/user.entity';
import { CommonStatus } from 'src/_enum/common.status';
import { genSaltSync, hashSync } from 'bcrypt';
import { DateTime } from 'luxon';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';
import { UserPicture } from 'src/_entity/user_picture.entity';

@Injectable()
export class UserService {
  constructor(private connection: DataSource) {}

  async findAll() {
    return responseSuccess(
      await this.connection
        .getRepository(User)
        .findBy({ status: CommonStatus.ACTIVE }),
    );
  }

  private generateHashedPassword(password: string): string {
    return hashSync(password, genSaltSync(12));
  }

  async create(body: UserDto): Promise<object> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { user_name, user_email, password, id_file } = body;
      if (!user_name || !user_email || !password)
        throw new BadRequestException('กรอกข้อมูลไม่ครบ');

      const formatEmail = user_email.toLowerCase();
      const dataHaveUse = await queryRunner.manager
        .getRepository(User)
        .createQueryBuilder('u')
        .where('u.status = :ac', { ac: CommonStatus.ACTIVE })
        .andWhere(
          new Brackets((qb) => {
            qb.where('u.user_name = :uname', {
              uname: user_name,
            }).orWhere('u.user_email = :email', { email: formatEmail });
          }),
        )
        .getOne();
      if (dataHaveUse) {
        throw new BadRequestException('มีการใช้ข้อมูลนี้ในระบบแล้ว');
      }

      const password_bcrypt = this.generateHashedPassword(password);
      const create = queryRunner.manager.getRepository(User).create({
        user_name: user_name,
        user_email: formatEmail,
        password: password_bcrypt,
        status: CommonStatus.ACTIVE,
        created_date: new Date(),
        modified_date: new Date(),
      });
      const save = await queryRunner.manager.getRepository(User).save(create);
      if (id_file)
        await queryRunner.manager
          .getRepository(UserPicture)
          .update(
            { id_user_picture: id_file },
            { id_user: save.id_user, status: CommonStatus.ACTIVE },
          );
      await queryRunner.commitTransaction();
      return responseSuccess(save);
    } catch (err: unknown) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      if (err) throw err;
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async update(id_user: number, body: UserDto): Promise<object> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { user_name, user_email, password, id_file } = body;
      if (!user_name || !user_email)
        throw new BadRequestException('กรอกข้อมูลไม่ครบ');

      const exits = await queryRunner.manager
        .getRepository(User)
        .findOneBy({ id_user: id_user, status: CommonStatus.ACTIVE });
      if (!exits) throw new NotFoundException();
      const formatEmail = user_email.toLowerCase();
      const dataHaveUse = await queryRunner.manager
        .getRepository(User)
        .createQueryBuilder('u')
        .where('u.status = :ac', { ac: CommonStatus.ACTIVE })
        .andWhere(
          new Brackets((qb) => {
            qb.where('u.user_name = :uname', {
              uname: user_name,
            }).orWhere('u.user_email = :email', { email: formatEmail });
          }),
        )
        .andWhere('u.id_user != id', { id: id_user })
        .getOne();
      if (dataHaveUse) {
        throw new BadRequestException('มีการใช้ข้อมูลนี้ในระบบแล้ว');
      }
      let password_bcrypt: string;
      if (password) {
        password_bcrypt = this.generateHashedPassword(password);
      }

      await queryRunner.manager.getRepository(User).update(
        { id_user: id_user },
        {
          user_name: user_name,
          user_email: formatEmail,
          password: password_bcrypt ? password_bcrypt : exits.password,
          modified_date: new Date(),
        },
      );

      await queryRunner.manager
        .getRepository(UserPicture)
        .update(
          { id_user: id_user, status: CommonStatus.ACTIVE },
          { status: CommonStatus.DELETED },
        );
      if (id_file)
        await queryRunner.manager
          .getRepository(UserPicture)
          .update(
            { id_user_picture: id_file },
            { id_user: id_user, status: CommonStatus.ACTIVE },
          );
      await queryRunner.commitTransaction();
      return responseSuccess();
    } catch (err: unknown) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      if (err) throw err;
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async uploadFile(file: Express.Multer.File, user_id: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!file) throw new BadRequestException();

      file.originalname = Buffer.from(file.originalname, 'latin1').toString(
        'utf8',
      );

      const rootFolder = process.env.FILE_PUBLIC_PATH;
      const now = DateTime.now();
      const newId = uuid();
      const newRelativePath =
        'employee_picture/' + now.toFormat('yyyy/MM/dd/') + newId + '/';
      if (!fs.existsSync(rootFolder + newRelativePath)) {
        fs.mkdirSync(rootFolder + newRelativePath, { recursive: true });
      }
      fs.writeFileSync(
        rootFolder + newRelativePath + file.originalname,
        file.buffer,
      );

      const newFileToSave = queryRunner.manager
        .getRepository(UserPicture)
        .create();
      newFileToSave.file_name = file.originalname;
      newFileToSave.file_size = file.size.toString();
      newFileToSave.file_type = file.mimetype;
      newFileToSave.file_path = newRelativePath;
      newFileToSave.status = CommonStatus.ACTIVE;
      newFileToSave.created_id = user_id;
      newFileToSave.modified_id = user_id;
      newFileToSave.created_date = new Date();
      newFileToSave.modified_date = new Date();

      const newFile = await queryRunner.manager
        .getRepository(UserPicture)
        .save(newFileToSave);
      await queryRunner.commitTransaction();
      return responseSuccess(newFile);
    } catch (err: unknown) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      if (err) throw err;
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }
}
