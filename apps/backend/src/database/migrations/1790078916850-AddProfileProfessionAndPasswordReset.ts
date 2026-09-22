import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileProfessionAndPasswordReset1790078916850 implements MigrationInterface {
    name = 'AddProfileProfessionAndPasswordReset1790078916850'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "professionId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD "avatarUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "pendingEmail" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "passwordResetCodeHash" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "passwordResetExpiresAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "professions" ALTER COLUMN "federalCouncil" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_109e267727209de350adb2424b9" FOREIGN KEY ("professionId") REFERENCES "professions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_109e267727209de350adb2424b9"`);
        await queryRunner.query(`ALTER TABLE "professions" ALTER COLUMN "federalCouncil" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordResetExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordResetCodeHash"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "pendingEmail"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarUrl"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "professionId"`);
    }

}
