class AppointmentFactory {
    static Build(simpleAppointment) { // <-- Torna Build estático
        let appoDate = new Date(simpleAppointment.date);

        let day = appoDate.getDate() + 1;
        let month = appoDate.getMonth();
        let year = appoDate.getFullYear();

        let hour = Number.parseInt(simpleAppointment.time.split(":")[0]);
        let minutes = Number.parseInt(simpleAppointment.time.split(":")[1]);

        let startDate = new Date(year, month, day, hour, minutes, 0, 0);
        // startDate.setHours(startDate.getHours() -3);

        let appo = {
            id: simpleAppointment._id,
            title: simpleAppointment.name + " " + simpleAppointment.description,
            start: startDate,
            end: startDate,
            notified: simpleAppointment.notified,
            email: simpleAppointment.email
        };

        return appo;
    }
}

export default AppointmentFactory;