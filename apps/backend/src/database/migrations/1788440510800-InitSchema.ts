import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1788440510800 implements MigrationInterface {
    name = 'InitSchema1788440510800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "violation_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "professionId" uuid, CONSTRAINT "PK_a28182f3c93a8a11ceca5d7e617" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "professions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "federalCouncil" character varying NOT NULL, "regionalCouncils" jsonb, CONSTRAINT "PK_9247c0d4b30fc6b796d59262058" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "violation_categories" ADD CONSTRAINT "FK_8caea2913ff43a0c31b7967a208" FOREIGN KEY ("professionId") REFERENCES "professions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "violation_categories" DROP CONSTRAINT "FK_8caea2913ff43a0c31b7967a208"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "professions"`);
        await queryRunner.query(`DROP TABLE "violation_categories"`);
    }

}
