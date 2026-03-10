import CriptografiaSenha from "../src/exemplo/adapters/auth/CriptografiaSenha";
import conexao from "../src/exemplo/adapters/db/knex/conexao";
import UsuarioCrud from "../src/exemplo/adapters/db/UsuarioCrud";
import type CrudGenerico from "../src/exemplo/appcore/ports/CrudGenerico";
import BuscaPorEmailUsuarioUsecase from "../src/exemplo/appcore/domain/usuario/BuscaPorEmailUsuarioUsecase";
import CriarUsuarioUsecase from "../src/exemplo/appcore/domain/usuario/CriarUsuarioUsecase";
import type UsuarioModel from "../src/exemplo/appcore/domain/usuario/UsuarioModel";

const crud: CrudGenerico<UsuarioModel> = new UsuarioCrud();
const criptografia = new CriptografiaSenha();
const criarUsuarioUsecase = new CriarUsuarioUsecase(crud, criptografia);
const buscarPorEmailUsuarioUsecase = new BuscaPorEmailUsuarioUsecase(crud);
const emailTeste: string = "abc@gmail.com";
const nomeTeste = "Antonio Santos";
const senhaTeste = "123456";

beforeAll(async () => {
   await conexao.table('usuarios').truncate();
});

// clean up between each test in case anything lingers
afterEach(async () => {
   await conexao.table('usuarios').truncate();
});

// close database connection when the tests finish
afterAll(async () => {
    await conexao.destroy();
});

test("Deve buscar um usuario", async () => {
    const usuarioCriado = await criarUsuarioUsecase.execute(nomeTeste, emailTeste, senhaTeste);
    const usuario = await buscarPorEmailUsuarioUsecase.execute(emailTeste);

    expect(usuarioCriado).not.toBeNull();
    expect(usuario).not.toBeNull();
    expect(usuario!.email).toBe(emailTeste);
});

test("Deve nao encontrar um usuario", async () => {
    const usuarioCriado = await criarUsuarioUsecase.execute(nomeTeste, emailTeste, senhaTeste);
    const usuario = await buscarPorEmailUsuarioUsecase.execute("aabb@gmail.com");

    expect(usuarioCriado).not.toBeNull();
    expect(usuario).toBeNull();
});