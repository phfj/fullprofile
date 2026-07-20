CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`confirmation_code` text,
	`is_email_verified` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `booking` (
	`id` text PRIMARY KEY NOT NULL,
	`condition` text NOT NULL,
	`guest_id` text NOT NULL,
	`programId` text NOT NULL,
	`price` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`guest_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`programId`) REFERENCES `program`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `accomodationPhotos` (
	`id` text PRIMARY KEY NOT NULL,
	`accomodation_id` text NOT NULL,
	`url` text NOT NULL,
	`alt` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`accomodation_id`) REFERENCES `accomodation`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `accomodation` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`text` text NOT NULL,
	`price` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `program` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`first_name` text NOT NULL,
	`last_name` text,
	`email` text NOT NULL,
	`hire_date` text NOT NULL,
	`status` text NOT NULL,
	`role_title` text NOT NULL,
	`department` text NOT NULL,
	`pay_type` text NOT NULL,
	`base_rate` numeric NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "status_check_employees" CHECK("employees"."status" IN ('active', 'inactive'))
);
--> statement-breakpoint
CREATE TABLE `paydetails` (
	`id` text PRIMARY KEY NOT NULL,
	`payslip_id` text,
	`line_type` text NOT NULL,
	`description` text NOT NULL,
	`amount` integer NOT NULL,
	FOREIGN KEY (`payslip_id`) REFERENCES `payslips`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "positive_amount_check" CHECK("paydetails"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE `payslips` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_id` text,
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`payment_date` text NOT NULL,
	`gross_pay` numeric NOT NULL,
	`total_deductions` numeric NOT NULL,
	`net_pay` text NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "status_check_payslips" CHECK("payslips"."status" IN ('draft', 'paid', 'failed'))
);
--> statement-breakpoint
CREATE TABLE `timesheets` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_id` text NOT NULL,
	`period_start` text,
	`period_end` text,
	`hours_worked` numeric NOT NULL,
	`overtime_hours` numeric NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "status_check_timesheets" CHECK("timesheets"."status" IN ('submitted', 'approved'))
);
