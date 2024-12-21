import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('auth_log')
export class AuthLog {
  @PrimaryGeneratedColumn({
    name: 'id_auth_log',
    comment: 'รหัสบันทึกการเข้า/ออกระบบ',
  })
  id_auth_log: number;

  @Column({ name: 'id_user', comment: 'รหัสพนักงาน' })
  id_user: number;

  @Column({
    name: 'access_token',
    type: 'text',
    comment: 'token สำหรับเรียกใช้งาน api ต่างๆ',
  })
  access_token: string;

  @Column({
    name: 'refresh_token',
    type: 'text',
    comment: 'token สำหรับใช้ขอ access token ใหม่ เมื่อหมดอายุ',
  })
  refresh_token: string;

  @Column({ nullable: true, comment: 'สถานะ' })
  status: string;

  @CreateDateColumn({
    name: 'created_date',
    comment: 'วัน เวลา ที่สร้างรายการ',
  })
  created_date: Date;

  @UpdateDateColumn({
    name: 'modified_date',
    comment: 'วัน เวลา ที่แก้ไขรายการ',
  })
  modified_date: Date;
}
