import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTemplateTable1623171800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable("template");
    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: "template",
          columns: [
            {
              name: "id",
              type: "int",
              isPrimary: true,
              isGenerated: true,
            },
            {
              name: "name",
              type: "text",
            },
            {
              name: "description",
              type: "text",
            },
            {
              name: "slug",
              type: "text",
              isUnique: true,
            },
            {
              name: "context_file",
              type: "text",
            },
            {
              name: "corpus_file",
              type: "text",
            },
            {
              name: "model_file",
              type: "text",
            },
            {
              name: "owner_id",
              type: "int",
            },
            {
              name: "owner_type",
              type: "text",
            },
            {
              name: "visibility",
              type: "text",
              default: "'private'",
            },
            {
              name: "created_at",
              type: "timestamp",
              default: "CURRENT_TIMESTAMP",
            },
            {
              name: "updated_at",
              type: "timestamp",
              default: "CURRENT_TIMESTAMP",
            },
          ],
        }),
        true
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable("template");
    if (tableExists) {
      await queryRunner.dropTable("template");
    }
  }
}
