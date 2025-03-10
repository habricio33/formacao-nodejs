import app from "../src/app.js";
import supertest from "supertest";
import mongoose from "mongoose"; 

let request = supertest(app);

let mainUser = {
    name: "Pedro R. Cecatto",
    email: "pedrorc@gmail.com",
    password: "123456"
};

beforeAll( () => {
    return request.post("/user")
    .send(mainUser)
    .then( res => {
        
    }).catch( err => {
        console.log(err);
    })
});

afterAll(async () => {
    jest.setTimeout(10000); // Define timeout maior para execução da exclusão
    await request.delete(`/user/${mainUser.email}`);
    await mongoose.connection.close(); // Fechar conexão somente após deletar o usuário de teste
});

describe("Cadastro de usuários", () => {
    test("Deve cadastrar um usuario com sucesso", async () => { 
        let time = Date.now();
        let email = `${time}@gmail.com`;     
        let user = {name: "Pedro", email: email, password: "123456"};
    
        const res = await request
            .post("/user")
            .send(user);
    
        expect(res.statusCode).toEqual(200);
        expect(res.body.email).toEqual(email);
    });

    test("Deve impedir que um usuário cadastre dados vazios", async () => {
        let user = {name: "", email: "", password: ""};

        const res = await request
            .post("/user")
            .send(user);

        expect(res.statusCode).toEqual(400); // status 400 = bad request

    });

    test("Deve impedir cadastro de e-mail duplicado", async () => { 
        let email = "teste@gmail.com";
        let user = { name: "Usuário Teste 2", email, password: "123456" };
        
        // Primeiro cadastro deve ser bem-sucedido
        const res1 = await request.post("/user").send(user);
        expect(res1.statusCode).toEqual(200);

        // Segundo cadastro deve falhar
        const res2 = await request.post("/user").send(user);
        expect(res2.statusCode).toEqual(400);
        expect(res2.body.error).toEqual("E-mail já cadastrado");
    });
    
});

describe("Autenticação", () => {
    test("Deve me retornar um token quando logar", async () => {
        const res = await request.post("/auth").send({
            email: mainUser.email,
            password: mainUser.password
        });
    
        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
    });

    test("Deve impedir que um usuario não cadastrado se logue", async () => {
        const res = await request.post("/auth").send({
            email: "emailnaoexistente@gmail.com",
            password: "senhaqualquer" 
        });
    
        expect(res.statusCode).toEqual(403);
        expect(res.body.errors.email).toEqual("Email não cadastrado");
    });

    test("Deve impedir que um usuario com a senha errada se logue", async () => {
        const res = await request.post("/auth").send({
            email: mainUser.email,
            password: "senhaErrada" 
        });
    
        expect(res.statusCode).toEqual(403);
        expect(res.body.errors.password).toEqual("Senha incorreta");
    });
    
})