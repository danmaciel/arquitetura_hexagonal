import type CrudGenerico from "../src/exemplo/appcore/ports/CrudGenerico";
import CriarUsuarioUsecase from "../src/exemplo/appcore/domain/usuario/CriarUsuarioUsecase";
import CriptografiaSenha from "../src/exemplo/adapters/auth/CriptografiaSenha";   
import type UsuarioModel from "../src/exemplo/appcore/domain/usuario/UsuarioModel";
import conexao from "../src/exemplo/adapters/db/knex/conexao";
import UsuarioCrud from "../src/exemplo/adapters/db/UsuarioCrud";
import UsuarioJaCadastradoError from "../src/exemplo/appcore/domain/errors/UsuarioJaCadastradoError";

const crud: CrudGenerico<UsuarioModel> = new UsuarioCrud();
const criptografia = new CriptografiaSenha();
const criarUsuarioUsecase = new CriarUsuarioUsecase(crud, criptografia);
const emailTeste: string = "abc@gmail.com";
const nomeTeste = "Antonio Santos";
const senhaTeste = "123456";

// ensure table empty before and after the suite to avoid uniqueness conflicts
beforeAll(async () => {
   await conexao.table('usuarios').truncate();
});

// clean up between each test in case anything lingers
afterEach(async () => {
   await conexao.table('usuarios').truncate();
});

// close database connection when the tests finish
afterAll(async () => {
    await conexao.table('usuarios').truncate();
    await conexao.destroy();
});

test("Deve criar um usuario", async () => {
    const usuario = await criarUsuarioUsecase.execute(nomeTeste, emailTeste, senhaTeste);

    expect(usuario).toHaveProperty("id");
    expect(usuario).toHaveProperty("nome");
    expect(usuario).toHaveProperty("email");
    expect(usuario).toHaveProperty("senha");

    expect(usuario.nome).toBe("Antonio Santos");
    expect(usuario.email).toBe("abc@gmail.com");
    expect(usuario.senha).toBe("654321");
    
});


test("Deve comparar a senha correta", async () => {
    const usuario = await criarUsuarioUsecase.execute(nomeTeste, emailTeste, senhaTeste);
    expect(criptografia.comparar(senhaTeste, usuario.senha!)).toBe(true);
});

test("Deve comparar a senha incorreta", async () => {
    const usuario = await criarUsuarioUsecase.execute(nomeTeste, emailTeste, senhaTeste);
    expect(criptografia.comparar("654321", usuario.senha!)).toBe(false);
});

test("Deve comparar a senha criptografada(real) correta", async () => {
    const usuario = await criarUsuarioUsecase.execute(nomeTeste, emailTeste, senhaTeste);
    expect(criptografia.comparar(senhaTeste, usuario.senha!)).toBe(true);
});

test("Deve comparar a senha criptografada(real) incorreta", async () => {
    const usuario = await criarUsuarioUsecase.execute(nomeTeste, emailTeste, senhaTeste);
    expect(criptografia.comparar("1234567", usuario.senha!)).toBe(false);
});

test("Deve lancar erro ao criar usuario com email ja existente", async () => {
    await criarUsuarioUsecase.execute(nomeTeste, emailTeste, senhaTeste);
    await expect(criarUsuarioUsecase.execute(nomeTeste, emailTeste, senhaTeste))
                .rejects.toThrow(UsuarioJaCadastradoError);
});
