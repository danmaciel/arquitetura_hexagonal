import knex from "knex";
import config from "../src/exemplo/adapters/db/knex/knexfile";
import { rmSync } from "node:fs";

/**
 * Two independent Knex/SQLite connections to the same disposable database file.
 * Both participants observe the email as absent before attempting their inserts.
 * The two insert promises are started together; SQLite itself serializes writes.
 */
test("conexões independentes não conseguem inserir dois usuários com o mesmo e-mail", async () => {
    const filename = process.env.SQLITE_DB_PATH;
    if (!filename) throw new Error("SQLITE_DB_PATH é necessário para este teste.");

    const options = {
        ...config,
        connection: { filename },
        pool: { min: 1, max: 1 }
    };
    const primeiraConexao = knex(options);
    const segundaConexao = knex(options);

    try {
        // The schema was created by the real migration, without mocks.
        await primeiraConexao.migrate.latest();
        const email = "corrida@example.invalid";
        const [primeiraBusca, segundaBusca] = await Promise.all([
            primeiraConexao("usuarios").where({ email }).first(),
            segundaConexao("usuarios").where({ email }).first()
        ]);
        expect(primeiraBusca).toBeUndefined();
        expect(segundaBusca).toBeUndefined();

        const tentativas = await Promise.allSettled([
            primeiraConexao("usuarios").insert({
                id: "corrida-a", nome: "Ana", email, senha: "hash-a"
            }),
            segundaConexao("usuarios").insert({
                id: "corrida-b", nome: "Bia", email, senha: "hash-b"
            })
        ]);

        const sucessos = tentativas.filter(
            (resultado): resultado is PromiseFulfilledResult<number[]> => resultado.status === "fulfilled"
        );
        const falhas = tentativas.filter(
            (resultado): resultado is PromiseRejectedResult => resultado.status === "rejected"
        );

        expect(sucessos).toHaveLength(1);
        expect(falhas).toHaveLength(1);

        const erro: unknown = falhas[0]?.reason;
        expect(erro).toMatchObject({
            code: expect.stringMatching(/^SQLITE_CONSTRAINT/),
            message: expect.stringContaining("UNIQUE constraint failed: usuarios.email")
        });

        const usuarios = await primeiraConexao("usuarios").where({ email });
        expect(usuarios).toHaveLength(1);
        expect(["corrida-a", "corrida-b"]).toContain(usuarios[0].id);
    } finally {
        await Promise.all([primeiraConexao.destroy(), segundaConexao.destroy()]);
        rmSync(filename, { force: true });
    }
});
