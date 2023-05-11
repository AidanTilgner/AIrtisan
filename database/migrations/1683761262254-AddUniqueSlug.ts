import { MigrationInterface, QueryRunner } from "typeorm";
import { getRandomID } from "../../utils/crypto";

export class AddUniqueSlug1683761262254 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // create the slug column
    await queryRunner.query(
      `ALTER TABLE "bot" ADD COLUMN "slug" TEXT NOT NULL DEFAULT ''`
    );

    // insert each row individually with a unique slug value
    const bots = await queryRunner.query(`SELECT * FROM "bot"`);
    for (const bot of bots) {
      const slug = getRandomID();
      await queryRunner.query(`UPDATE "bot" SET "slug" = $1 WHERE "id" = $2`, [
        slug,
        bot.id,
      ]);
    }

    // create the unique index for the slug column
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_bot_slug" ON "bot" ("slug")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // drop the unique index for the slug column
    await queryRunner.query(`DROP INDEX "IDX_bot_slug"`);

    // drop the slug column
    await queryRunner.query(`ALTER TABLE "bot" DROP COLUMN "slug"`);
  }
}
