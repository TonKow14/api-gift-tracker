import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'person' })
export class Person {
  @PrimaryGeneratedColumn()
  id_person: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  id_user: number;

  @Column()
  status: string;

  @Column()
  created_date: Date;

  @Column()
  modified_date: Date;

  @Column()
  created_id: number;

  @Column()
  modified_id: number;
}
