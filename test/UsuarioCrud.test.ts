import conexao from "../src/exemplo/adapters/db/knex/conexao";
import UsuarioCrud from "../src/exemplo/adapters/db/UsuarioCrud";
import UsuarioModel from "../src/exemplo/appcore/domain/usuario/UsuarioModel";
import { rmSync } from "node:fs";

const repositorio = new UsuarioCrud();

beforeAll(async () => {
    await conexao.migrate.latest();
});

afterEach(async () => {
    await conexao.table("usuarios").del();
});

afterAll(async () => {
    await conexao.destroy();
    const filename = process.env.SQLITE_DB_PATH;
    if (filename) rmSync(filename, { force: true });
});

test("adapter retorna a entidade que persistiu", async () => {
    const usuario = new UsuarioModel("id-test", "Maria", "maria@example.invalid", "hash-teste");
    const criado = await repositorio.adicionar(usuario);

    expect(criado).toEqual(usuario);
    const encontrado = await repositorio.buscarPorEmail( usuario.email);
    expect(encontrado).toMatchObject({ id: usuario.id, nome: usuario.nome, email: usuario.email });
});

test("adapter retorna null ao não encontrar usuário", async () => {
    await expect(repositorio.buscarPorEmail( "inexistente@example.invalid")).resolves.toBeNull();
});
