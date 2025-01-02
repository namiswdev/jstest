// migrations/create_users_table.js
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.char('role_type', 1).notNullable().defaultTo('u');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};

// migrations/create_listings_table.js
exports.up = function(knex) {
  return knex.schema.createTable('listings', function(table) {
    table.bigIncrements('id').primary();
    table.string('name', 255).notNullable();
    table.double('latitude').notNullable().checkBetween([-90, 90]);
    table.double('longitude').notNullable().checkBetween([-180, 180]);
    table.bigInteger('user_id').unsigned().references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('listings');
};

// migrations/create_migrations_table.js
exports.up = function(knex) {
  return knex.schema.createTable('migrations', function(table) {
    table.increments('id').primary();
    table.string('migration', 255).notNullable();
    table.integer('batch').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('migrations');
};
