import express from "express";
import mongoose from "mongoose";
import AppointmentService from "./services/AppointmentService.js";
import mailer from "nodemailer"; 

const app = express(); 

const port = 8083;

// Configurações do Express
app.set("view engine", "ejs"); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

// URL de conexão com o MongoDB (altere conforme necessário)
const mongoURI = "mongodb://localhost:27017/agendamento";

// Conectando ao MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB conectado com sucesso!"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));


// Rota básica
app.get("/", (req, res) => {    
    res.render("index");
}); 

app.get("/cadastro", (req, res) => {    
    res.render("create");
}); 

app.post("/create", async (req, res) => {    
    let status = await AppointmentService.createAppointment(
        req.body.name,
        req.body.email,
        req.body.cpf,
        req.body.description,
        req.body.date,
        req.body.time,
    )

    if(status) {
        res.redirect("/cadastro");
    } else {
        res.send("Ocorreu um erro ao cadastrar")
    }
}); 

app.get("/getCalendar", async (req, res) => {    
     let consultas =  await AppointmentService.getAllAppointment(false);
     res.json(consultas);
}); 

app.get("/event/:id", async (req, res) => {
    let id = req.params.id;
    let appointment = await AppointmentService.getAppointmentById(id);
    res.render("event", { appo: appointment })
    // res.json({id: id});
});

app.post("/finish", async (req, res) => {
    let id = req.body.id;
    let result = await AppointmentService.finishAppointment(id);
    res.render("index");
});

app.get("/list", async (req, res) => {  
    let appos = await AppointmentService.getAll();    
    res.render("list",{ appos });
});

app.get("/searchresult", async (req, res) => {  
  let appos = await AppointmentService.search(req.query.search);
   res.render("list",{ appos });
});

let pollTime = 1000 * 6 * 5;

setInterval(async () => {
    await AppointmentService.sendNotification();
}, pollTime);


// Iniciando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
