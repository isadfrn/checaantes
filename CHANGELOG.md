# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

## 0.0.1 (2026-09-22)

### Funcionalidades

* Add authentication and professions management endpoints with corresponding configurations and documentation for login, registration, and CRUD operations. ([6966cec](https://github.com/isadfrn/checaantes/commit/6966cec7ae19576c0f31d51a5a3b20c3b0041fca))
* Add DTOs for changing email, changing password, and updating profile, enhancing user management capabilities ([55c0df5](https://github.com/isadfrn/checaantes/commit/55c0df53646bfaa7d859e8407f3af9cdfa68d6dd))
* Add LICENSE file with copyright notice and permissions for software usage and distribution ([ae41966](https://github.com/isadfrn/checaantes/commit/ae41966595e106597a49cb1fa26798c13e67af1f))
* Add README.md with project overview, setup instructions, API routes, and technologies used for Checa Antes ([cdb85b5](https://github.com/isadfrn/checaantes/commit/cdb85b5d4df0076b6dcb45b5ca743b05b5787714))
* Add Unleash feature flagging service with PostgreSQL database support in docker-compose and update package dependencies ([583a774](https://github.com/isadfrn/checaantes/commit/583a774b9fcc1509277df65fd97fa63f32abb785))
* Add user entity, role-based access control decorators, and DTOs for login and registration, along with roles guard and database connection setup ([d121612](https://github.com/isadfrn/checaantes/commit/d12161231384163c3396aaa9fe1c5605b6001e32))
* Add user profile fields and email confirmation features to the users table, including name, phone, state, and email confirmation token ([901b2aa](https://github.com/isadfrn/checaantes/commit/901b2aa4a3914d7074c632df3001800f1752ee29))
* Add ViolationCategory entity to define violation categories with relationships to professions in the backend application. ([6a6705f](https://github.com/isadfrn/checaantes/commit/6a6705f37b5d643c48a2295f5ab6d898ff438cff))
* Enhance authentication flow by adding email confirmation, password reset, and user profile management endpoints ([354cbe8](https://github.com/isadfrn/checaantes/commit/354cbe8582872a285916bcfd38ecc80634997798))
* Enhance AuthService with profession linking, email confirmation, and password reset functionalities, improving user registration and authentication processes ([6dda1a1](https://github.com/isadfrn/checaantes/commit/6dda1a12194e2d4d8922b1d40b3f362577aaa2c4))
* Enhance ProfessionsController with Swagger documentation and update profession entity fields for better null handling ([47718e8](https://github.com/isadfrn/checaantes/commit/47718e8847b59e21edafdd4ec92bea4b99d40c03))
* Expand AuthController with new endpoints for email confirmation, password reset, and resend confirmation, enhancing user authentication capabilities ([c1f84b7](https://github.com/isadfrn/checaantes/commit/c1f84b750d3e605eb4ae1b2fcb528dc74fd2716f))
* Implement authentication module with AuthController, AuthService, and JWT authentication guard, including unit tests for registration and login functionalities. ([20a731f](https://github.com/isadfrn/checaantes/commit/20a731fb47cbc353d6be4d3aa10ed26ef67e8608))
* Implement FeatureFlagsService for managing feature flags using Unleash, including initialization and error handling ([a7cddf0](https://github.com/isadfrn/checaantes/commit/a7cddf0d278bd3741cda3c80f8f11f29a07c8987))
* Implement LocalDiskStorageService for file storage and management, including save and remove functionalities ([b48778a](https://github.com/isadfrn/checaantes/commit/b48778af514ea9cec06dcf4f72555113ec38fbd5))
* Implement MailModule and MailService for email handling, including confirmation and password reset functionalities ([662b5d3](https://github.com/isadfrn/checaantes/commit/662b5d358ac6bb488b39bf49c21590228b0b142b))
* Implement Professions module with controller, service, and entity for managing professions, including CRUD operations and unit tests. ([8c9dab5](https://github.com/isadfrn/checaantes/commit/8c9dab578b405fe50f586f0b671d9adb1c3ce725))
* Implement update and remove methods in ProfessionsController and ProfessionsService, along with corresponding unit tests and authentication guards for enhanced security. ([3170f2c](https://github.com/isadfrn/checaantes/commit/3170f2c4ce91fec8a93d140da47f9bf48db5d9f5))
* Implement UsersModule with UsersController and UsersService for user profile management, including updating profile, changing password, and uploading avatar functionalities ([5e16108](https://github.com/isadfrn/checaantes/commit/5e1610899425898d5f00593cfc6dc1bec742130c))
* Initialize backend application with NestJS framework, including configuration files, basic structure, and sample controller/service. Added Prettier and OXLint configurations for code formatting and linting. Set up testing environment with Vitest and included example tests. ([e470875](https://github.com/isadfrn/checaantes/commit/e470875311a706f224deb1946a0a8f5bc1a17a0d))
* Integrate AuthModule, add global validation pipes, and implement database seeding for initial user and profession data ([cc65303](https://github.com/isadfrn/checaantes/commit/cc65303a1636e10c34268331f1671002ffec9b60))
* Integrate ConfigModule and TypeOrmModule for PostgreSQL database connection, and include ProfessionsModule in the application module. ([1d51c9c](https://github.com/isadfrn/checaantes/commit/1d51c9c2951b0237fa33b011c4d38444c4ae3614))
* Integrate Swagger documentation and static asset handling in the backend, enhancing API visibility and file upload capabilities ([58a495e](https://github.com/isadfrn/checaantes/commit/58a495e279b984a26dfdd562a68fea68ba60b2a4))
* Introduce Brazilian states constant, user DTOs for email confirmation, password reset, and registration, and enhance user entity with additional fields for improved authentication and user management ([7bad368](https://github.com/isadfrn/checaantes/commit/7bad36888a09f6e133ab2fe2d2101292c3c02989))
* Update seed functionality to handle multiple professions and enhance admin user management with profile updates ([3bd826a](https://github.com/isadfrn/checaantes/commit/3bd826ab34acb93c23f5c52276a505cedf7c5dcc))

### Correções

* Specify column type for name in ViolationCategory entity to ensure proper database schema definition ([646ec92](https://github.com/isadfrn/checaantes/commit/646ec92082f001a7b3f713d3a8774bbbe8ac4a00))

### Refatoração

* Rename professionRepository to professionsRepository for consistency and implement update and remove methods in ProfessionsService ([56cf422](https://github.com/isadfrn/checaantes/commit/56cf4222da76cb06e6e1442e41d8b56afa9c75d5))

### Testes

* Enhance unit tests for ProfessionsController and ProfessionsService with additional test cases for findAll, findOne, and create methods, including error handling for non-existent professions. ([867bdd6](https://github.com/isadfrn/checaantes/commit/867bdd6311ce6a24c9fdb0c985ae1b68d6e664a7))
