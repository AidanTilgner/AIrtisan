import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfilePictureURLToAdmin1685249009398
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // add a "profile_picture_url" column to the admin table
    await queryRunner.query(
      `ALTER TABLE "admin" ADD COLUMN "profile_picture_path" TEXT NOT NULL DEFAULT ''`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // drop the "profile_picture_url" column from the admin table
    await queryRunner.query(
      `ALTER TABLE "admin" DROP COLUMN "profile_picture_path"`
    );
  }
}
