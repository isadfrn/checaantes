import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ViolationCategory } from './violation-category.entity.js';

@Entity('professions')
export class Profession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  federalCouncil: string | null;

  @Column({ type: 'jsonb', nullable: true })
  regionalCouncils: string[] | null;

  @OneToMany(() => ViolationCategory, (category) => category.profession)
  violationCategories: ViolationCategory[];
}
