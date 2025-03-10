import app from "../src/app.js";
import supertest from "supertest";

let request = supertest(app);

test("A aplicação deve rodar na porta 3131", () => {
    return request.get("/")
    .then(res => {
        let status = res.statusCode;
        expect(status).toEqual(200);
    }).catch(err => {
        fail(err);
    });
});