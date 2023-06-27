import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class AddFeedbackTable1685295781407 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "feedback",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "feedback",
            type: "text",
          },
          {
            name: "type",
            type: "text",
          },
          {
            name: "adminId",
            type: "integer",
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
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "feedback",
      new TableForeignKey({
        columnNames: ["adminId"],
        referencedColumnNames: ["id"],
        referencedTableName: "admin",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const feedbackTable = await queryRunner.getTable("feedback");
    await queryRunner.dropColumn("feedback", "adminId");
    await queryRunner.dropTable("feedback");
    const foreignKey = feedbackTable?.foreignKeys.find((fk) =>
      fk.columnNames.includes("adminId")
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey("feedback", foreignKey);
    }
  }
}
