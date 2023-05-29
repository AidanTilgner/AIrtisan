import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReviewedColumnToFeedbackTable1685307035374
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // add a "reviewed" column to the feedback table
    if (!(await queryRunner.hasColumn("feedback", "reviewer"))) {
      await queryRunner.query(`
            ALTER TABLE feedback
            ADD COLUMN reviewer STRING NULL DEFAULT FALSE
        `);
    }
    if (!(await queryRunner.hasColumn("feedback", "review_message"))) {
      await queryRunner.query(`
            ALTER TABLE feedback
            ADD COLUMN review_message STRING NULL DEFAULT FALSE
        `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("feedback", "reviewer")) {
      await queryRunner.query(`
            ALTER TABLE feedback
            DROP COLUMN reviewer
        `);
    }
    if (await queryRunner.hasColumn("feedback", "review_message")) {
      await queryRunner.query(`
            ALTER TABLE feedback
            DROP COLUMN review_message
        `);
    }
  }
}
