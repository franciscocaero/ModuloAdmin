// Importaciones necesarias
import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()

// Configuración de nodemailer (transporter)
let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.HOST_MAILTRAP,
    port: process.env.PORT_MAILTRAP,
    auth: {
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP,
    }
});

// Función para enviar correo al usuario
const sendMailToUser = (userMail, token) => {
    // Configuración del correo
    let mailOptions = {
        from: process.env.USER_MAILTRAP, // Dirección del remitente
        to: userMail, // Lista de destinatarios
        subject: "Verifica tu cuenta", // Línea de asunto
        html: `<p>Hola, haz clic <a href="${process.env.URL_BACKEND}confirmar/${encodeURIComponent(token)}">aquí</a> para confirmar tu cuenta.</p>` // Cuerpo del correo
    };
    

    transporter.sendMail(mailOptions, function(error, info){
        // Enviar el correo
        if (error) {
            console.log(error); // Si hay un error, imprimirlo en consola
        } else {
            console.log('Correo enviado: ' + info.response); // Si se envía correctamente, imprimirlo en consola
        }
    });
};

// send mail with defined transport object
const sendMailToRecoveryPassword = async(userMail,token)=>{
    let info = await transporter.sendMail({
    from: 'admin@vet.com',
    to: userMail,
    subject: "Correo para reestablecer tu contraseña",
    html: `
    <h1>Sistema de gestión (VET-ESFOT 🐶 😺 🎈)</h1>
    <hr>
    <a href=${process.env.URL_BACKEND}recuperar-password/${token}>Clic para reestablecer tu contraseña</a>
    <hr>
    <footer>Grandote te da la Bienvenida!</footer>
    `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
}



export {
    sendMailToUser,
    sendMailToRecoveryPassword
} // Exportar la función sendMailToUser y sendMailToRecoveryPassword