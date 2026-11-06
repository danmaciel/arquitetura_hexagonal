import CriarUsuarioUsecase from "../src/exemplo/appcore/domain/usuario/CriarUsuarioUsecase";
import BuscaPorEmailUsuarioUsecase from "../src/exemplo/appcore/domain/usuario/BuscaPorEmailUsuarioUsecase";
import UsuarioJaCadastradoError from "../src/exemplo/appcore/domain/errors/UsuarioJaCadastradoError";
import UsuarioModel from "../src/exemplo/appcore/domain/usuario/UsuarioModel";
import type UsuarioRepository from "../src/exemplo/appcore/ports/UsuarioRepository";
import type ProvedorCriptografia from "../src/exemplo/appcore/ports/ProvedorCriptografia";

describe("casos de uso com portas falsas (sem banco)", () => {
    const existingUser = new UsuarioModel("existing", "Ana", "ana@example.com", "hash");

    function dependencies(existing: UsuarioModel | null = null) {
        const repository: jest.Mocked<UsuarioRepository> = {
            adicionar: jest.fn(async (user) => user),
            buscarPorEmail: jest.fn(async () => existing)
        };
        const crypto: jest.Mocked<ProvedorCriptografia> = {
            criptografar: jest.fn((password) => `hashed:${password}`),
            comparar: jest.fn((password, hash) => hash === `hashed:${password}`)
        };
        return { repository, crypto };
    }

    test("criar usuário persiste com senha transformada", async () => {
        const { repository, crypto } = dependencies();
        const usecase = new CriarUsuarioUsecase(repository, crypto);

        const user = await usecase.execute("Ana", "ana@example.com", "secret");

        expect(repository.buscarPorEmail).toHaveBeenCalledWith("ana@example.com");
        expect(crypto.criptografar).toHaveBeenCalledWith("secret");
        expect(repository.adicionar).toHaveBeenCalledWith(user);
        expect(user.senha).toBe("hashed:secret");
        expect(user.email).toBe("ana@example.com");
    });

    test("usuário duplicado não é persistido nem tem senha processada", async () => {
        const { repository, crypto } = dependencies(existingUser);
        const usecase = new CriarUsuarioUsecase(repository, crypto);

        await expect(usecase.execute("Ana", "ana@example.com", "secret"))
            .rejects.toThrow(UsuarioJaCadastradoError);

        expect(repository.adicionar).not.toHaveBeenCalled();
        expect(crypto.criptografar).not.toHaveBeenCalled();
    });

    test("falha ao persistir é propagada ao chamador", async () => {
        const { repository, crypto } = dependencies();
        repository.adicionar.mockRejectedValueOnce(new Error("Falha de armazenamento"));

        await expect(new CriarUsuarioUsecase(repository, crypto)
            .execute("Ana", "ana@example.com", "secret"))
            .rejects.toThrow("Falha de armazenamento");
    });

    test("busca por email retorna usuário existente ou null", async () => {
        const { repository } = dependencies(existingUser);
        const find = new BuscaPorEmailUsuarioUsecase(repository);
        await expect(find.execute(existingUser.email)).resolves.toBe(existingUser);
        repository.buscarPorEmail.mockResolvedValueOnce(null);
        await expect(find.execute("missing@example.com")).resolves.toBeNull();
    });
});
