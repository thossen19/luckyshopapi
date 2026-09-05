-- CreateTable
CREATE TABLE `homepage_slides` (
    `id` VARCHAR(191) NOT NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `image_url` VARCHAR(191) NULL,
    `bg_color` VARCHAR(191) NULL,
    `title` TEXT NOT NULL DEFAULT '',
    `subtitle` TEXT NULL,
    `button_text` VARCHAR(191) NOT NULL DEFAULT 'Shop Now',
    `product_id` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `homepage_slides_store_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `homepage_slides` ADD CONSTRAINT `homepage_slides_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homepage_slides` ADD CONSTRAINT `homepage_slides_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
