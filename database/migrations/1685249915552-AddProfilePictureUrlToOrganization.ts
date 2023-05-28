import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfilePictureUrlToOrganization1685249915552
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasProfilePictureURLColumn = await queryRunner.hasColumn(
      "organization",
      "profile_picture_path"
    );

    if (hasProfilePictureURLColumn) {
      return;
    }

    // add "profile_picture_url" column to the organization table
    await queryRunner.query(
      `ALTER TABLE "organization" ADD COLUMN "profile_picture_path" TEXT NOT NULL DEFAULT ''`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasProfilePictureURLColumn = await queryRunner.hasColumn(
      "organization",
      "profile_picture_path"
    );

    if (!hasProfilePictureURLColumn) {
      return;
    }

    // drop the "profile_picture_url" column from the organization table
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "profile_picture_path"`
    );
  }
}
