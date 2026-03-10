
exports.up = async function(knex) {
  let exists = await knex.schema.hasTable('usuarios');
  if (!exists) {
    return knex.schema.createTable('usuarios', function(table) {
      table.uuid('id').primary();
      table.string('nome').notNullable();
      table.string('email').notNullable().unique();
      table.string('senha').notNullable();
    });
  }
};

exports.down = async function(knex) {
  let exists = await knex.schema.hasTable('usuarios');
  if (exists) {
    return knex.schema.dropTable('usuarios');
  }
};
