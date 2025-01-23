import { ApiProperty } from '@nestjs/swagger';
import { Person } from 'src/_entity/person.entity';
import { PaignateApiPropertyQuery } from 'src/_utils/decorators/paginate-query.decorator';

export class CreatePersonDto {
  @ApiProperty({ description: 'ชื่อจริง' })
  first_name: string;

  @ApiProperty({ description: 'ชื่อจริง' })
  last_name: string;
}

export class UpdatePersonDto extends CreatePersonDto {}

export class QueryFindAllPerson extends PaignateApiPropertyQuery {
  @ApiProperty({ description: 'ค้นหา', required: false })
  search: string;
}
