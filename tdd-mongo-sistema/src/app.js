import express from "express";
import mongoose from "mongoose";
import User from "./models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWTSecret = "minhaChaveSecreta";

const mongoURI = "mongodb://localhost:27017/agendamento";

mongoose.connect(mongoURI)
  .then(() => {
    // não exibir console.log pois emite erro no teste
  })
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

let app = express();
app.use(express.json());
 
// Rota de cadastro de usuário
app.post("/user", async (req, res) => {
    if(req.body.name == "" || req.body.email == "" || req.body.password == "") {
        return res.sendStatus(400); // Retorna erro 400 caso algum campo esteja vazio
    }

    try {
        // Verifica se já existe um usuário com o mesmo email
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ error: "E-mail já cadastrado" });
        }

        let password = req.body.password;
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(password, salt);

        // Se não existir, cria e salva o usuário
        const user = new User({ name: req.body.name, email: req.body.email, password: hash });
        await user.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota principal
app.get("/", (req, res) => {
    res.json({});
});

app.post("/auth", async (req, res) => {
    let { email, password } = req.body;

    let user = await User.findOne({"email": email});

    if(!user){     
        return res.status(403).json({
            errors: { email: "Email não cadastrado" }
        });
         
    }

    let isPasswordRight = await bcrypt.compare(password, user.password);

    if(!isPasswordRight){
        return res.status(403).json({
            errors: { password: "Senha incorreta" }
        });
    }

    jwt.sign({ email: email, name: user.name, id: user._id }, JWTSecret, { expiresIn: '48h' }, (err, token) => {
        if(err){
            res.sendStatus(500);
            console.log(err);
        }else {
            res.json({ token: token })
        }
    });
})

// rota de remoção de usuario apenas em desenvolvimento/teste
app.delete("/user/:email", async (req, res) => {
    await User.deleteOne({ "email": req.params.email });
    res.sendStatus(200);
});




// Fechar a conexão do MongoDB quando o processo for encerrado
process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("Conexão com MongoDB fechada.");
    process.exit(0);
});

export default app;
