import mongoose from "mongoose";        

const appointment = new mongoose.Schema({
    name: String,
    email: String,
    cpf: String,
    description: String,
    date: Date,
    time: String,
    finished: Boolean,
    notified: Boolean     
});

export default appointment;