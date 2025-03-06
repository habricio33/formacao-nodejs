import appointment from "../models/Appointment.js";
import mongoose from "mongoose";
import AppointmentFactory from "../factories/appointmentFactory.js";
import mailer from "nodemailer";

const Appo = mongoose.model("Appointment", appointment);

const createAppointment = async (name, email, cpf, description, date, time) => {
    const newAppo = new Appo({
        name,
        email,      
        cpf,
        description,
        date,
        time,
        finished: false,
        notified: false
    });

    try {
        await newAppo.save();
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const getAllAppointment = async (isFinished) => {
    if(isFinished) { 
        return await Appo.find({ 'finished': true }) 
    } else {       
        let appos = await Appo.find({ 'finished': false }) 
        let appointments = [];
    
        appos.forEach(appointment => {
            if (appointment.date !== undefined) {
                appointments.push(AppointmentFactory.Build(appointment));
            }
        });
    
        return appointments;
    }
    
}

const getAll = async () => { 
    return await Appo.find({});
}

const getAppointmentById = async (id) => {
    try {

        let event = await Appo.findOne({ '_id': id })
        return event;
    } catch (err) {
        console.log(err);
    }
}

const finishAppointment = async (id) => {
    try {
         await Appo.findByIdAndUpdate(id, { 'finished': true });
         return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

const search = async (query) => {
      try{
        let appos =  await Appo.find().or([{ email: query },{ cpf: query }]);
        return appos;

      } catch(err) {
        console.log(err);
        return [];
      }    
}

const sendNotification = async () => {
    let appos = await getAllAppointment(false); 

    let transporter = mailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "***********f70",
            pass: "***********ff6"        
        }
    });

    appos.forEach( async (appo)=> {

        let date = appo.start.getTime();
        let hour = 1000 * 60 * 60;
        let gap = date - Date.now();

        if(gap <= hour){
            
            if(!appo.notified){

                await Appo.findByIdAndUpdate(appo.id, { notified: true });

                transporter.sendMail({
                    from: "MedApp <hello@demomailtrap.co>",
                    to: appo.email,
                    subject: "Falta menos de 1 hora para sua consulta",
                    text: "Sua consulta vai acontecer em breve"
                })
                .then(() => {

                })
                .catch(err => {
                    console.log("Houve um erro ao enviar o email", err);
                })
            }
        }

    })
  };

export default { 
    createAppointment, 
    getAllAppointment, 
    getAppointmentById, 
    finishAppointment, 
    getAll, 
    search, 
    sendNotification
};

 