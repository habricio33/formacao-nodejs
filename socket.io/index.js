import express from "express";
import { createServer } from "http";
import { connect } from "http2";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer); 

const port = 3000;

io.on("connection", (socket) => { 

    socket.on("disconnect", () => {
        console.log("X desconectou" + socket.id)
    });
    
    socket.on("msg", (data) => {
        io.emit("showMsg", data);
    })
})

// Configurações do Express
app.set("view engine", "ejs"); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
 
// Rota básica
app.get("/", (req, res) => {    

    res.render("index");
}); 

// Iniciando o servidor
httpServer.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
