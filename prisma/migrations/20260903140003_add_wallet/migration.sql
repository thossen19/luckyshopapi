-- AlterTable
ALTER TABLE `customers` ADD COLUMN `wallet_balance` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `wallet_cashback` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `wallet_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `type` ENUM('TOPUP', 'WITHDRAWAL', 'PAYMENT', 'REFUND', 'CASHBACK', 'ROUNDING', 'ADJUSTMENT', 'REFERRAL') NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `balance_after` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `order_id` VARCHAR(191) NULL,
    `reference` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_by_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `wallet_transactions_customer_id_idx`(`customer_id`),
    INDEX `wallet_transactions_store_id_idx`(`store_id`),
    INDEX `wallet_transactions_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
