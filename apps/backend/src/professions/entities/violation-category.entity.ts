import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import type { Profession } from './profession.entity.js';

@Entity('violation_categories')
export class ViolationCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(
    'Profession',
    (profession: Profession) => profession.violationCategories,
  )
  profession: Profession;
}
