import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user_picture' })
export class UserPicture {
  @PrimaryGeneratedColumn()
  id_user_picture: number;

  @Column()
  id_user: number;

  @Column()
  file_name: string;

  @Column()
  file_path: string;

  @Column()
  file_type: string;

  @Column()
  file_size: string;

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
