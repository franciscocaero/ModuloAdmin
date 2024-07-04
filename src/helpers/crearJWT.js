//Importar jwt
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

//Crear el método para firmar (id-rol) y generar el jwttoken
const generarJWT = (id,rol)=>{
    return jwt.sign({id,rol},process.env.JWT_SECRET,{expiresIn:"1d"})
}

//Exportar la funcion 
export default  generarJWT