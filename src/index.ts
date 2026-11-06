import { randomUUID } from "node:crypto";
import knexConnection from "./exemplo/adapters/db/knex/conexao";
import UsuarioCrud from "./exemplo/adapters/db/UsuarioCrud";
import CriptografiaSenhaReal from "./exemplo/adapters/auth/CriptografiaSenhaReal";
import CriarUsuarioUsecase from "./exemplo/appcore/domain/usuario/CriarUsuarioUsecase";
import BuscaPorEmailUsuarioUsecase from "./exemplo/appcore/domain/usuario/BuscaPorEmailUsuarioUsecase";

/**
 * Composition root: this entry point connects infrastructure to domain ports.
 * This is a local CLI demonstration, not an HTTP server.
 */
async function main(): Promise<void> {
    try {
        await knexConnection.migrate.latest();

        const repository = new UsuarioCrud();
        const cryptography = new CriptografiaSenhaReal();
        const createUser = new CriarUsuarioUsecase(repository, cryptography);
        const findUser = new BuscaPorEmailUsuarioUsecase(repository);

        const email = `demo-${randomUUID()}@example.invalid`;
        const created = await createUser.execute("Usuário de demonstração", email, "exemplo-local-123");
        const found = await findUser.execute(email);

        if (!found || found.id !== created.id) {
            throw new Error("Falha ao consultar o usuário criado.");
        }

        // Never log the password hash.
        console.log("Demonstração concluída:");
        console.log({ id: found.id, nome: found.nome, email: found.email });
    } finally {
        await knexConnection.destroy();
    }
}

main().catch((error: unknown) => {
    console.error("Falha na demonstração:", error instanceof Error ? error.message : "Erro desconhecido");
    process.exitCode = 1;
});
