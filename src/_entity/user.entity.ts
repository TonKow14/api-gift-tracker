import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id_user: number;

  @Column()
  user_name: string;

  @Column()
  user_email: string;

  @Column()
  password: string;

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
