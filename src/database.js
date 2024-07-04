import mongoose from "mongoose"; // Importar mongoose
import dotenv from "dotenv"; // Importar dotenv

dotenv.config(); // Configurar dotenv
// Establecer una regla
mongoose.set("strictQuery", true);

// Conectar a la base de datos
const connectDB = async () => {
    try {
        console.log("Conectando a la base de datos...");
         // Conectar a la base de datos
        const conn = await mongoose.connect(process.env.MONGODB_URI_LOCAL);
        console.log(`MongoDB Connected: ${conn.connection.host} - ${conn.connection.port}`); // Mensaje de conexión exitosa
    } catch (error) {
        console.error(`Error: ${error.message}`);  // Mensaje de error
        //process.exit(1);
    }
};

export default connectDB; // Exportar la función connectDB
