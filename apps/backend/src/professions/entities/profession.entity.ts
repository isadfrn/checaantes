import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ViolationCategory } from './violation-category.entity.js';

@Entity('professions')
export class Profession {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  federalCouncil: string;
  @Column({ type: 'jsonb', nullable: true })
  regionalCouncils: string[];
  @OneToMany(() => ViolationCategory, (category) => category.profession)
  violationCategories: ViolationCategory[];
}
