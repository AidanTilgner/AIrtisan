import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfilePictureURLToAdmin1685249009398
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasProfilePictureURLColumn = await queryRunner.hasColumn(
      "admin",
      "profile_picture_path"
    );

    if (hasProfilePictureURLColumn) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "admin" ADD COLUMN "profile_picture_path" TEXT NOT NULL DEFAULT ''`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasProfilePictureURLColumn = await queryRunner.hasColumn(
      "admin",
      "profile_picture_path"
    );

    if (!hasProfilePictureURLColumn) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "admin" DROP COLUMN "profile_picture_path"`
    );
  }
}
