import conexao from "../src/exemplo/adapters/db/knex/conexao";
import UsuarioCrud from "../src/exemplo/adapters/db/UsuarioCrud";
import UsuarioModel from "../src/exemplo/appcore/domain/usuario/UsuarioModel";
import UsuarioJaCadastradoError from "../src/exemplo/appcore/domain/errors/UsuarioJaCadastradoError";
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

test("adapter converte violação UNIQUE de e-mail em erro de domínio", async () => {
    const original = new UsuarioModel("id-unique-1", "Maria", "duplicado@example.invalid", "hash-1");
    const duplicado = new UsuarioModel("id-unique-2", "Outra", original.email, "hash-2");

    await repositorio.adicionar(original);
    let erroRecebido: unknown;
    try {
        await repositorio.adicionar(duplicado);
    } catch (error) {
        erroRecebido = error;
    }
    expect(erroRecebido).toBeInstanceOf(UsuarioJaCadastradoError);

    const encontrado = await repositorio.buscarPorEmail(original.email);
    expect(encontrado?.id).toBe(original.id);
});

test("adapter preserva violações de outras restrições", async () => {
    const original = new UsuarioModel("id-pk", "Maria", "primeiro@example.invalid", "hash-1");
    const mesmoId = new UsuarioModel("id-pk", "Outra", "segundo@example.invalid", "hash-2");

    await repositorio.adicionar(original);
    await expect(repositorio.adicionar(mesmoId)).rejects.not.toThrow(UsuarioJaCadastradoError);
});
