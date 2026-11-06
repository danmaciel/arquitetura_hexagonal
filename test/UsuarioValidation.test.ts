import CriarUsuarioUsecase from "../src/exemplo/appcore/domain/usuario/CriarUsuarioUsecase";
import type UsuarioRepository from "../src/exemplo/appcore/ports/UsuarioRepository";
import type ProvedorCriptografia from "../src/exemplo/appcore/ports/ProvedorCriptografia";

describe("validação de entrada do caso de uso", () => {
    const repository: jest.Mocked<UsuarioRepository> = {
        adicionar: jest.fn(async (user) => user),
        buscarPorEmail: jest.fn(async (_email: string) => null)
    };
    const cryptography: jest.Mocked<ProvedorCriptografia> = {
        criptografar: jest.fn((password: string) => `hash:${password}`),
        comparar: jest.fn((password: string, hash: string) => hash === `hash:${password}`)
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        ["nome em branco", "", "usuario@example.invalid", "senha-segura"],
        ["email inválido", "Maria", "email-invalido", "senha-segura"],
        ["senha vazia", "Maria", "usuario@example.invalid", "  "]
    ])("rejeita %s antes de consultar infraestrutura", async (_scenario, name, email, password) => {
        const usecase = new CriarUsuarioUsecase(repository, cryptography);
        await expect(usecase.execute(name, email, password)).rejects.toThrow();
        expect(repository.buscarPorEmail).not.toHaveBeenCalled();
        expect(repository.adicionar).not.toHaveBeenCalled();
        expect(cryptography.criptografar).not.toHaveBeenCalled();
    });
});
