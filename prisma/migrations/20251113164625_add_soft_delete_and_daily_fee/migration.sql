/*
  Warnings:

  - Added the required column `daily_fee` to the `attendance_records` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `attendance_records` ADD COLUMN `daily_fee` INTEGER NOT NULL DEFAULT 70000;

-- AlterTable
ALTER TABLE `students` ADD COLUMN `deleted_at` DATETIME(3) NULL;
