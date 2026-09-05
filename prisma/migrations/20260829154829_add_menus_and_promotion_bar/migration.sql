-- AlterTable
ALTER TABLE `homepage_slides` MODIFY `title` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `store_settings` ADD COLUMN `promotion_bar_color` VARCHAR(191) NULL DEFAULT '#059669',
    ADD COLUMN `promotion_bar_enabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `promotion_bar_text` TEXT NULL,
    ADD COLUMN `promotion_bar_text_color` VARCHAR(191) NULL DEFAULT '#ffffff';

-- CreateTable
CREATE TABLE `menus` (
    `id` VARCHAR(191) NOT NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `location` ENUM('HEADER', 'FOOTER', 'MOBILE', 'SIDEBAR') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `menus_store_id_idx`(`store_id`),
    INDEX `menus_location_idx`(`location`),
    UNIQUE INDEX `menus_slug_store_id_key`(`slug`, `store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_items` (
    `id` VARCHAR(191) NOT NULL,
    `menu_id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `url` TEXT NULL,
    `category_id` VARCHAR(191) NULL,
    `page_type` VARCHAR(191) NOT NULL DEFAULT 'CATEGORY',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `menu_items_menu_id_idx`(`menu_id`),
    INDEX `menu_items_category_id_idx`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `menus` ADD CONSTRAINT `menus_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
