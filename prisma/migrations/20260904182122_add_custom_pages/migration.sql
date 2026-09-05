-- CreateTable
CREATE TABLE `custom_pages` (
    `id` VARCHAR(191) NOT NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `title` TEXT NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `template` VARCHAR(191) NOT NULL DEFAULT 'blank',
    `description` TEXT NULL,
    `seo_title` TEXT NULL,
    `seo_description` TEXT NULL,
    `seo_keywords` TEXT NULL,
    `background` VARCHAR(191) NOT NULL DEFAULT '#ffffff',
    `max_width` INTEGER NOT NULL DEFAULT 960,
    `blocks` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `custom_pages_store_id_slug_key`(`store_id`, `slug`),
    INDEX `custom_pages_store_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `custom_pages` ADD CONSTRAINT `custom_pages_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
