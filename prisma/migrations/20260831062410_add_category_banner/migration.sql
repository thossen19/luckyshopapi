-- AlterTable
ALTER TABLE `categories` ADD COLUMN `banner_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `banner_gradient` VARCHAR(191) NULL,
    ADD COLUMN `banner_image` VARCHAR(191) NULL,
    ADD COLUMN `banner_subtitle` TEXT NULL,
    ADD COLUMN `banner_title` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `homepage_slides` MODIFY `title` TEXT NOT NULL DEFAULT '';
