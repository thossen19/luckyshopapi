-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `role` ENUM('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF', 'CUSTOMER') NOT NULL DEFAULT 'STORE_OWNER',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_login_at` DATETIME(3) NULL,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `two_factor_enabled` BOOLEAN NOT NULL DEFAULT false,
    `two_factor_secret` VARCHAR(191) NULL,
    `store_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_store_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    INDEX `refresh_tokens_token_idx`(`token`),
    INDEX `refresh_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `store_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    INDEX `roles_store_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `module` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NOT NULL,

    INDEX `permissions_role_id_idx`(`role_id`),
    UNIQUE INDEX `permissions_name_role_id_key`(`name`, `role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stores` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `logo` VARCHAR(191) NULL,
    `favicon` VARCHAR(191) NULL,
    `domain` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL DEFAULT 'US',
    `zip_code` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `language` VARCHAR(191) NOT NULL DEFAULT 'en',
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'America/New_York',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `subscription_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `stores_slug_key`(`slug`),
    UNIQUE INDEX `stores_domain_key`(`domain`),
    INDEX `stores_slug_idx`(`slug`),
    INDEX `stores_domain_idx`(`domain`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `store_settings` (
    `id` VARCHAR(191) NOT NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `tax_rate` DECIMAL(5, 2) NULL DEFAULT 0,
    `tax_enabled` BOOLEAN NOT NULL DEFAULT false,
    `shipping_enabled` BOOLEAN NOT NULL DEFAULT true,
    `free_shipping_threshold` DECIMAL(10, 2) NULL,
    `flat_shipping_rate` DECIMAL(10, 2) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `weight_unit` VARCHAR(191) NOT NULL DEFAULT 'lb',
    `dimension_unit` VARCHAR(191) NOT NULL DEFAULT 'in',
    `maintenance_mode` BOOLEAN NOT NULL DEFAULT false,
    `seo_title` VARCHAR(191) NULL,
    `seo_description` TEXT NULL,
    `seo_keywords` VARCHAR(191) NULL,
    `social_facebook` VARCHAR(191) NULL,
    `social_instagram` VARCHAR(191) NULL,
    `social_twitter` VARCHAR(191) NULL,
    `social_youtube` VARCHAR(191) NULL,
    `custom_css` TEXT NULL,
    `custom_js` TEXT NULL,
    `header_html` TEXT NULL,
    `footer_html` TEXT NULL,
    `theme_primary_color` VARCHAR(191) NULL DEFAULT '#6366f1',
    `theme_accent_color` VARCHAR(191) NULL DEFAULT '#f59e0b',
    `theme_font` VARCHAR(191) NULL DEFAULT 'Inter',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `store_settings_store_id_key`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_plans` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `yearly_price` DECIMAL(10, 2) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `billing_cycle` VARCHAR(191) NOT NULL DEFAULT 'monthly',
    `trial_days` INTEGER NOT NULL DEFAULT 0,
    `max_products` INTEGER NULL,
    `max_employees` INTEGER NULL,
    `max_orders` INTEGER NULL,
    `max_storage` INTEGER NULL,
    `features` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscription_plans_slug_key`(`slug`),
    INDEX `subscription_plans_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `plan_id` VARCHAR(191) NOT NULL,
    `status` ENUM('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID') NOT NULL DEFAULT 'TRIALING',
    `billing_cycle` VARCHAR(191) NOT NULL DEFAULT 'monthly',
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `current_period_start` DATETIME(3) NOT NULL,
    `current_period_end` DATETIME(3) NOT NULL,
    `trial_start` DATETIME(3) NULL,
    `trial_end` DATETIME(3) NULL,
    `canceled_at` DATETIME(3) NULL,
    `cancel_at_period_end` BOOLEAN NOT NULL DEFAULT false,
    `payment_method_id` VARCHAR(191) NULL,
    `stripe_customer_id` VARCHAR(191) NULL,
    `stripe_subscription_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscriptions_store_id_key`(`store_id`),
    UNIQUE INDEX `subscriptions_stripe_customer_id_key`(`stripe_customer_id`),
    UNIQUE INDEX `subscriptions_stripe_subscription_id_key`(`stripe_subscription_id`),
    INDEX `subscriptions_store_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` VARCHAR(191) NOT NULL,
    `subscription_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `status` ENUM('PENDING', 'PAID', 'VOID', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
    `invoice_number` VARCHAR(191) NOT NULL,
    `due_date` DATETIME(3) NOT NULL,
    `paid_at` DATETIME(3) NULL,
    `payment_method` VARCHAR(191) NULL,
    `stripe_invoice_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_invoice_number_key`(`invoice_number`),
    INDEX `invoices_subscription_id_idx`(`subscription_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `image` VARCHAR(191) NULL,
    `parent_id` VARCHAR(191) NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `seo_title` VARCHAR(191) NULL,
    `seo_description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `categories_store_id_idx`(`store_id`),
    INDEX `categories_parent_id_idx`(`parent_id`),
    UNIQUE INDEX `categories_slug_store_id_key`(`slug`, `store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brands` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `logo` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `brands_store_id_idx`(`store_id`),
    UNIQUE INDEX `brands_slug_store_id_key`(`slug`, `store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attributes` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('TEXT', 'NUMBER', 'COLOR', 'SELECT') NOT NULL DEFAULT 'TEXT',
    `store_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `attributes_name_store_id_key`(`name`, `store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attribute_values` (
    `id` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `color_code` VARCHAR(191) NULL,
    `attribute_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `attribute_values_attribute_id_idx`(`attribute_id`),
    UNIQUE INDEX `attribute_values_value_attribute_id_key`(`value`, `attribute_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NULL,
    `barcode` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `short_description` TEXT NULL,
    `type` ENUM('SIMPLE', 'VARIABLE', 'DIGITAL', 'SUBSCRIPTION', 'BUNDLE', 'SERVICE') NOT NULL DEFAULT 'SIMPLE',
    `status` ENUM('DRAFT', 'ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `store_id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NULL,
    `brand_id` VARCHAR(191) NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `cost_price` DECIMAL(10, 2) NULL,
    `sale_price` DECIMAL(10, 2) NULL,
    `tax_rate` DECIMAL(5, 2) NULL DEFAULT 0,
    `weight` DECIMAL(8, 2) NULL,
    `length` DECIMAL(8, 2) NULL,
    `width` DECIMAL(8, 2) NULL,
    `height` DECIMAL(8, 2) NULL,
    `stock_quantity` INTEGER NOT NULL DEFAULT 0,
    `low_stock_threshold` INTEGER NOT NULL DEFAULT 5,
    `track_inventory` BOOLEAN NOT NULL DEFAULT true,
    `allow_backorder` BOOLEAN NOT NULL DEFAULT false,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `is_digital` BOOLEAN NOT NULL DEFAULT false,
    `digital_file_url` VARCHAR(191) NULL,
    `tags` TEXT NULL,
    `meta_title` VARCHAR(191) NULL,
    `meta_description` TEXT NULL,
    `seo_keywords` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `products_barcode_key`(`barcode`),
    INDEX `products_store_id_idx`(`store_id`),
    INDEX `products_category_id_idx`(`category_id`),
    INDEX `products_brand_id_idx`(`brand_id`),
    INDEX `products_status_idx`(`status`),
    INDEX `products_is_featured_idx`(`is_featured`),
    INDEX `products_price_idx`(`price`),
    UNIQUE INDEX `products_slug_store_id_key`(`slug`, `store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `barcode` VARCHAR(191) NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `cost_price` DECIMAL(10, 2) NULL,
    `sale_price` DECIMAL(10, 2) NULL,
    `stock_quantity` INTEGER NOT NULL DEFAULT 0,
    `low_stock_threshold` INTEGER NOT NULL DEFAULT 5,
    `weight` DECIMAL(8, 2) NULL,
    `image` VARCHAR(191) NULL,
    `option_values` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `product_variants_sku_key`(`sku`),
    INDEX `product_variants_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_images` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `product_images_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_attributes` (
    `id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `attribute_id` VARCHAR(191) NOT NULL,
    `attribute_value_id` VARCHAR(191) NULL,
    `value` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `product_attributes_product_id_attribute_id_key`(`product_id`, `attribute_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `total_spent` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `total_orders` INTEGER NOT NULL DEFAULT 0,
    `loyalty_points` INTEGER NOT NULL DEFAULT 0,
    `segment` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `last_purchase_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `customers_store_id_idx`(`store_id`),
    INDEX `customers_email_idx`(`email`),
    UNIQUE INDEX `customers_email_store_id_key`(`email`, `store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `address1` VARCHAR(191) NOT NULL,
    `address2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NULL,
    `zip_code` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'US',
    `phone` VARCHAR(191) NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `type` ENUM('SHIPPING', 'BILLING', 'BOTH') NOT NULL DEFAULT 'SHIPPING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `addresses_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carts` (
    `id` VARCHAR(191) NOT NULL,
    `session_id` VARCHAR(191) NULL,
    `customer_id` VARCHAR(191) NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `coupon_code` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `carts_customer_id_idx`(`customer_id`),
    INDEX `carts_session_id_idx`(`session_id`),
    UNIQUE INDEX `carts_customer_id_store_id_key`(`customer_id`, `store_id`),
    UNIQUE INDEX `carts_session_id_store_id_key`(`session_id`, `store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart_items` (
    `id` VARCHAR(191) NOT NULL,
    `cart_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `variant_id` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cart_items_cart_id_idx`(`cart_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wishlist_items` (
    `id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `wishlist_items_customer_id_product_id_key`(`customer_id`, `product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `order_number` VARCHAR(191) NOT NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `payment_status` ENUM('PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED') NOT NULL DEFAULT 'PENDING',
    `fulfillment_status` ENUM('UNFULFILLED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'RETURNED') NOT NULL DEFAULT 'UNFULFILLED',
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `tax_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `shipping_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `coupon_code` VARCHAR(191) NULL,
    `shipping_first_name` VARCHAR(191) NULL,
    `shipping_last_name` VARCHAR(191) NULL,
    `shipping_address1` VARCHAR(191) NULL,
    `shipping_address2` VARCHAR(191) NULL,
    `shipping_city` VARCHAR(191) NULL,
    `shipping_state` VARCHAR(191) NULL,
    `shipping_zip_code` VARCHAR(191) NULL,
    `shipping_country` VARCHAR(191) NULL,
    `shipping_phone` VARCHAR(191) NULL,
    `billing_first_name` VARCHAR(191) NULL,
    `billing_last_name` VARCHAR(191) NULL,
    `billing_address1` VARCHAR(191) NULL,
    `billing_address2` VARCHAR(191) NULL,
    `billing_city` VARCHAR(191) NULL,
    `billing_state` VARCHAR(191) NULL,
    `billing_zip_code` VARCHAR(191) NULL,
    `billing_country` VARCHAR(191) NULL,
    `shipping_method` VARCHAR(191) NULL,
    `tracking_number` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `customer_note` TEXT NULL,
    `ip` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_order_number_key`(`order_number`),
    INDEX `orders_store_id_idx`(`store_id`),
    INDEX `orders_customer_id_idx`(`customer_id`),
    INDEX `orders_status_idx`(`status`),
    INDEX `orders_order_number_idx`(`order_number`),
    INDEX `orders_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `variant_id` VARCHAR(191) NULL,
    `product_name` VARCHAR(191) NOT NULL,
    `variant_name` VARCHAR(191) NULL,
    `sku` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `tax_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `tax_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,

    INDEX `order_items_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_status_history` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED') NOT NULL,
    `note` TEXT NULL,
    `created_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_status_history_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED') NOT NULL DEFAULT 'PENDING',
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `transaction_id` VARCHAR(191) NULL,
    `stripe_payment_id` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `refunded_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `payments_order_id_idx`(`order_id`),
    INDEX `payments_transaction_id_idx`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refunds` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `payment_id` VARCHAR(191) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `reason` TEXT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `stripe_refund_id` VARCHAR(191) NULL,
    `created_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `refunds_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipments` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `carrier` VARCHAR(191) NULL,
    `tracking_number` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'IN_TRANSIT', 'DELIVERED', 'RETURNED') NOT NULL DEFAULT 'PENDING',
    `estimated_delivery` DATETIME(3) NULL,
    `actual_delivery` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `shipments_order_id_idx`(`order_id`),
    INDEX `shipments_tracking_number_idx`(`tracking_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `warehouses` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `address` TEXT NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `warehouses_store_id_idx`(`store_id`),
    UNIQUE INDEX `warehouses_code_store_id_key`(`code`, `store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory` (
    `id` VARCHAR(191) NOT NULL,
    `warehouse_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NULL,
    `variant_id` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `reserved_qty` INTEGER NOT NULL DEFAULT 0,
    `available_qty` INTEGER NOT NULL DEFAULT 0,
    `cost_price` DECIMAL(10, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `inventory_warehouse_id_idx`(`warehouse_id`),
    INDEX `inventory_product_id_idx`(`product_id`),
    INDEX `inventory_variant_id_idx`(`variant_id`),
    UNIQUE INDEX `inventory_warehouse_id_product_id_variant_id_key`(`warehouse_id`, `product_id`, `variant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `warehouse_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NULL,
    `variant_id` VARCHAR(191) NULL,
    `type` ENUM('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'TRANSFER', 'OPENING') NOT NULL,
    `quantity` INTEGER NOT NULL,
    `reference_type` VARCHAR(191) NULL,
    `reference_id` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `created_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `inventory_transactions_warehouse_id_idx`(`warehouse_id`),
    INDEX `inventory_transactions_product_id_idx`(`product_id`),
    INDEX `inventory_transactions_variant_id_idx`(`variant_id`),
    INDEX `inventory_transactions_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `contact_person` VARCHAR(191) NULL,
    `tax_number` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `balance` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `suppliers_store_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_orders` (
    `id` VARCHAR(191) NOT NULL,
    `po_number` VARCHAR(191) NOT NULL,
    `supplier_id` VARCHAR(191) NOT NULL,
    `warehouse_id` VARCHAR(191) NOT NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'RECEIVED', 'CANCELLED', 'PARTIALLY_RECEIVED') NOT NULL DEFAULT 'DRAFT',
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `tax_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `shipping_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `notes` TEXT NULL,
    `expected_date` DATETIME(3) NULL,
    `received_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `purchase_orders_po_number_key`(`po_number`),
    INDEX `purchase_orders_supplier_id_idx`(`supplier_id`),
    INDEX `purchase_orders_warehouse_id_idx`(`warehouse_id`),
    INDEX `purchase_orders_store_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_items` (
    `id` VARCHAR(191) NOT NULL,
    `purchase_order_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NULL,
    `variant_id` VARCHAR(191) NULL,
    `product_name` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL,
    `received_qty` INTEGER NOT NULL DEFAULT 0,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,

    INDEX `purchase_items_purchase_order_id_idx`(`purchase_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_payments` (
    `id` VARCHAR(191) NOT NULL,
    `purchase_order_id` VARCHAR(191) NULL,
    `supplier_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `supplier_payments_purchase_order_id_idx`(`purchase_order_id`),
    INDEX `supplier_payments_supplier_id_idx`(`supplier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupons` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `discount_type` ENUM('PERCENTAGE', 'FIXED', 'FREE_SHIPPING', 'BUY_X_GET_Y') NOT NULL,
    `discount_value` DECIMAL(10, 2) NOT NULL,
    `minimum_amount` DECIMAL(10, 2) NULL,
    `maximum_discount` DECIMAL(10, 2) NULL,
    `usage_limit` INTEGER NULL,
    `used_count` INTEGER NOT NULL DEFAULT 0,
    `per_customer_limit` INTEGER NULL,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `store_id` VARCHAR(191) NOT NULL,
    `applicable_products` JSON NULL,
    `applicable_categories` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `coupons_store_id_idx`(`store_id`),
    INDEX `coupons_code_idx`(`code`),
    UNIQUE INDEX `coupons_code_store_id_key`(`code`, `store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('PERCENTAGE_OFF', 'FIXED_OFF', 'BUY_X_GET_Y', 'FREE_SHIPPING', 'FLASH_SALE') NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `buy_quantity` INTEGER NULL,
    `get_quantity` INTEGER NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `store_id` VARCHAR(191) NOT NULL,
    `product_ids` JSON NULL,
    `category_ids` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `promotions_store_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaigns` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('EMAIL', 'SMS', 'PUSH') NOT NULL,
    `description` TEXT NULL,
    `content` TEXT NULL,
    `scheduled_at` DATETIME(3) NULL,
    `sent_at` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'SCHEDULED', 'SENT', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `recipients` JSON NULL,
    `metrics` JSON NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `campaigns_store_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gift_cards` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `balance` DECIMAL(10, 2) NOT NULL,
    `sender_name` VARCHAR(191) NULL,
    `sender_email` VARCHAR(191) NULL,
    `recipient_name` VARCHAR(191) NULL,
    `recipient_email` VARCHAR(191) NULL,
    `message` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `expires_at` DATETIME(3) NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `gift_cards_code_key`(`code`),
    INDEX `gift_cards_code_idx`(`code`),
    INDEX `gift_cards_store_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loyalty_points` (
    `id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL,
    `type` ENUM('EARNED', 'REDEEMED', 'EXPIRED', 'ADJUSTED') NOT NULL,
    `reference` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `loyalty_points_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `comment` TEXT NULL,
    `images` JSON NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `helpful` INTEGER NOT NULL DEFAULT 0,
    `response` TEXT NULL,
    `responded_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `reviews_product_id_idx`(`product_id`),
    INDEX `reviews_customer_id_idx`(`customer_id`),
    INDEX `reviews_store_id_idx`(`store_id`),
    INDEX `reviews_rating_idx`(`rating`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expenses` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `receipt` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `created_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `expenses_store_id_idx`(`store_id`),
    INDEX `expenses_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('INCOME', 'EXPENSE', 'REFUND', 'PURCHASE', 'TAX', 'DISCOUNT') NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `description` TEXT NULL,
    `reference_type` VARCHAR(191) NULL,
    `reference_id` VARCHAR(191) NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `accounting_transactions_store_id_idx`(`store_id`),
    INDEX `accounting_transactions_type_idx`(`type`),
    INDEX `accounting_transactions_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `store_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('ORDER', 'PAYMENT', 'INVENTORY', 'PROMOTION', 'SYSTEM', 'SUPPORT', 'AI') NOT NULL,
    `channel` ENUM('EMAIL', 'SMS', 'PUSH', 'IN_APP') NOT NULL DEFAULT 'IN_APP',
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_idx`(`user_id`),
    INDEX `notifications_store_id_idx`(`store_id`),
    INDEX `notifications_is_read_idx`(`is_read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_templates` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `event` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NULL,
    `email_body` TEXT NULL,
    `sms_body` TEXT NULL,
    `push_body` TEXT NULL,
    `in_app_body` TEXT NULL,
    `variables` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `notification_templates_event_key`(`event`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_usage` (
    `id` VARCHAR(191) NOT NULL,
    `store_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,
    `provider` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `operation` VARCHAR(191) NOT NULL,
    `input_tokens` INTEGER NOT NULL DEFAULT 0,
    `output_tokens` INTEGER NOT NULL DEFAULT 0,
    `cost` DECIMAL(10, 6) NOT NULL DEFAULT 0,
    `prompt` TEXT NULL,
    `response` TEXT NULL,
    `metadata` JSON NULL,
    `duration` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_usage_store_id_idx`(`store_id`),
    INDEX `ai_usage_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analytics_events` (
    `id` VARCHAR(191) NOT NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NULL,
    `entity_id` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `ip` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `session_id` VARCHAR(191) NULL,
    `customer_id` VARCHAR(191) NULL,
    `page` VARCHAR(191) NULL,
    `referrer` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `analytics_events_store_id_idx`(`store_id`),
    INDEX `analytics_events_event_type_idx`(`event_type`),
    INDEX `analytics_events_created_at_idx`(`created_at`),
    INDEX `analytics_events_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_tickets` (
    `id` VARCHAR(191) NOT NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NOT NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `assigned_to` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `support_tickets_store_id_idx`(`store_id`),
    INDEX `support_tickets_customer_id_idx`(`customer_id`),
    INDEX `support_tickets_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_messages` (
    `id` VARCHAR(191) NOT NULL,
    `ticket_id` VARCHAR(191) NOT NULL,
    `sender_id` VARCHAR(191) NULL,
    `sender_type` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `is_internal` BOOLEAN NOT NULL DEFAULT false,
    `attachments` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `support_messages_ticket_id_idx`(`ticket_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `store_id` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `ip` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_user_id_idx`(`user_id`),
    INDEX `audit_logs_store_id_idx`(`store_id`),
    INDEX `audit_logs_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `audit_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `store_settings` ADD CONSTRAINT `store_settings_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_subscription_id_fkey` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brands` ADD CONSTRAINT `brands_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attributes` ADD CONSTRAINT `attributes_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attribute_values` ADD CONSTRAINT `attribute_values_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `attributes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_attributes` ADD CONSTRAINT `product_attributes_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_attributes` ADD CONSTRAINT `product_attributes_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `attributes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_status_history` ADD CONSTRAINT `order_status_history_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `warehouses` ADD CONSTRAINT `warehouses_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `suppliers` ADD CONSTRAINT `suppliers_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_items` ADD CONSTRAINT `purchase_items_purchase_order_id_fkey` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_items` ADD CONSTRAINT `purchase_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_payments` ADD CONSTRAINT `supplier_payments_purchase_order_id_fkey` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupons` ADD CONSTRAINT `coupons_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotions` ADD CONSTRAINT `promotions_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gift_cards` ADD CONSTRAINT `gift_cards_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loyalty_points` ADD CONSTRAINT `loyalty_points_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_usage` ADD CONSTRAINT `ai_usage_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_usage` ADD CONSTRAINT `ai_usage_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analytics_events` ADD CONSTRAINT `analytics_events_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_tickets` ADD CONSTRAINT `support_tickets_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_messages` ADD CONSTRAINT `support_messages_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
