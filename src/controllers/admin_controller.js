import administrador from "../models/administrador.js"
import { sendMailToUser, sendMailToRecoveryPassword} from "../config/nodemailer.js"
import mongoose from "mongoose"
import generarJWT from "../helpers/crearJWT.js";


const login = async (req,res)=>{
    // Actividad 1 (Request)
    const {email, password} = req.body;

    // Actividad 2 (Validaciones)
    //? Validar si los campos están vacíos
    if(Object.values(req.body).includes('')){
        return res.status(400).json({error:'Lo sentimos pero faltan datos'})
    }

    //? Validar si el email existe
    const adminBDD = await administrador.findOne({'email':email})

    //? Validar si el email está confirmado
    if (adminBDD?.confirmEmail === false){ // Si el email está confirmado (?.) operación de encadenamiento opcional (opcional chaining)
        return res.status(403).json({error:'Lo sentimos, debes confirmar tu email'})
    }

    //? Validar si el email existe
    if (!adminBDD){
        return res.status(404).json({error:'Lo sentimos, el email no existe'})
    }

    //? Validar si el password es correcto
    const validarPassword = await adminBDD.matchPassword(password)
    if (!validarPassword){
        return res.status(403).json({error:'Lo sentimos, la contraseña es incorrecta'})
    }

    // Actividad 3 (Base de Datos)
    const token = generarJWT(adminBDD._id, 'veterinario')
    const {nombre, apellido, direccion, telefono, _id} = adminBDD

    // Actividad 4 (Respuesta)
    res.status(200).json({
        msg:'Administrador logueado',
        data:{nombre, apellido, direccion, telefono, email:adminBDD.email, _id, token}
    })
}

const perfil = (req,res)=>{
    delete req.adminBDD.token // Eliminar el token
    delete req.adminBDD.confirmEmail // Eliminar el confirmEmail
    delete req.adminBDD.createdAt // Eliminar el createdAt
    delete req.adminBDD.updatedAt // Eliminar el updatedAt
    delete req.adminBDD.__v // Eliminar el __v
    res.status(200).json(req.adminBDD) // Responder con el veterinario
}


const registro = async (req,res)=>{
    //* Actividad 1 (Request)
    const {email,password} = req.body

    //* Actividad 2 (Validaciones)
    if(Object.values(req.body).includes('')){
        return res.status(400).json({error:'Lo sentimos pero faltan datos'})
    }
    const verificarEmailBDD = await administrador.findOne({email})
    if(verificarEmailBDD){
        return res.status(400).json({error:'Lo sentimos pero el email ya existe'})
    }

    //* Actividad 3 (Guardar en BDD)
    const nuevoadmin = new administrador(req.body)
    nuevoadmin.password = await nuevoadmin.encrypPassword(password)
    const token = nuevoadmin.crearToken()
    
    await nuevoadmin.save()
    sendMailToUser(email, token)
    //* Actividad 4 (Respuesta)
    res.status(200).json({msg:'Administrador registrado, por favor confirma tu email'})
}


const confirmEmail = async (req,res)=>{
    //* Actividad 1 (Validaciones)
    if(!(req.params.token)) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        
        //* Actividad 2 (Buscar en BDD)
        const adminBDD = await administrador.findOne({token:req.params.token})
        if(!adminBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
        
        //* Actividad 3 (Guardar en BDD)
        adminBDD.token = null
        adminBDD.confirmEmail = true
        await adminBDD.save()
        
        //* Actividad 4 (Respuesta)
        res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"})
}
const listaradministradores = (req,res)=>{
    res.status(200).json({res:'lista de administradores registrados'})
}
const detalleadministrador = async (req,res)=>{
    // Actividad 1 (Request)
    const {id} = req.params
    // Actividad 2 (Validaciones)
    //? Validar si el id es válido
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    //? Validar si el veterinario existe
    const adminBDD = await administrador.findById(id).select("-password")
    if(!adminBDD) return res.status(404).json({msg:`Lo sentimos, no existe el administrador ${id}`})
    // Actividad 3 (Respuesta)
    res.status(200).json({msg:adminBDD})
}
const actualizarPerfil = async (req,res)=>{
    // Actividad 1 (Request)
    const {id} = req.params
    const {nombre, apellido, direccion, telefono} = req.body
    // Actividad 2 (Validaciones)
    //? Validar si los campos están vacíos
    if (Object.values(req.body).includes('')){
        return res.status(400).json({error:'Lo sentimos pero faltan datos'})
    }
    //? Validar si el email existe
    const adminBDD = await administrador.findOne({id})
    if (!adminBDD){
        return res.status(404).json({error:'Lo sentimos, el email no existe'})
    }
    //? Validar si la informacion es la misma
    const userInfo = {
        nombre:adminBDD.nombre,
        apellido:adminBDD.apellido,
        direccion:adminBDD.direccion,
        telefono:adminBDD.telefono
    }
    if (JSON.stringify(userInfo) === JSON.stringify({nombre, apellido, direccion, telefono})){
        return res.status(400).json({error:'Lo sentimos, la información es la misma'})
    }
    // Actividad 3 (Base de Datos)
    await administrador.findOneAndUpdate({id}, req.body, {new:true})
    // Actividad 4 (Respuesta)
    res.status(200).json({msg:'Perfil actualizado'})
}
const actualizarPassword = async (req,res)=>{
    // Actividad 1 (Request)
    const {email, password, newpassword, confirmpassword} = req.body
    // Actividad 2 (Validaciones)
    //? Validar si los campos están vacíos
    if (Object.values(req.body).includes('')){
        return res.status(400).json({error:'Lo sentimos pero faltan datos'})
    }
    //? Validar si el email existe
    const adminBDD = await administrador.findOne({email})
    if (!adminBDD){
        return res.status(404).json({error:'Lo sentimos, el email no existe'})
    }
    //? Validar si la contraseña es la misma
    const validarPassword = await adminBDD.matchPassword(password)
    if (!validarPassword){
        return res.status(403).json({error:'Lo sentimos, la contraseña es incorrecta'})
    }
    //? Validar si la contraseña es la misma
    if (password === newpassword){
        return res.status(400).json({error:'Lo sentimos, la contraseña es la misma'})
    }
    //? Validar si las contraseñas coinciden
    if (newpassword !== confirmpassword){
        return res.status(400).json({error:'Lo sentimos, las contraseñas no coinciden'})
    }
    // Actividad 3 (Base de Datos)
    adminBDD.password = await adminBDD.encrypPassword(newpassword)
    await adminBDD.save()
    // Actividad 4 (Respuesta)
    res.status(200).json({msg:'Contraseña actualizada'})
}

const actualizarEmail = async (req, res) => {
    try {
        // Actividad 1 (Request)
        const { email, newEmail } = req.body;

        // Actividad 2 (Validaciones)
        //? Validar si los campos están vacíos
        if (!email || !newEmail) {
            return res.status(400).json({ error: 'Lo sentimos pero faltan datos' });
        }

        //? Validar si el nuevo email ya existe
        const emailExistente = await administrador.findOne({ email: newEmail });
        if (emailExistente) {
            return res.status(409).json({ error: 'Lo sentimos, el email ya se encuentra registrado' });
        }

        //? Validar si el email actual es correcto
        const adminBDD = await administrador.findOne({ email });
        if (!adminBDD) {
            return res.status(404).json({ error: 'Lo sentimos, el email actual no existe' });
        }

        //? Validar si el email es el mismo
        if (email === newEmail) {
            return res.status(400).json({ error: 'Lo sentimos, el email es el mismo' });
        }
        
        // Actividad 3 (Base de Datos)
        const newadminBDD = await administrador.findOne(req.adminBDD._id)
        newadminBDD.email = newEmail
        
        await adminBDD.save();

        // Actividad 4 (Respuesta)
        return res.status(200).json({ msg: 'Email actualizado' });
    } catch (error) {
        // Manejo de errores
        return res.status(500).json({ error: 'Error al actualizar el email', msg: error.message });
    }
};


const recuperarPassword = async (req,res)=>{
    // Actividad 1 (Request)
    const {email} = req.body
    // Actividad 2 (Validaciones)
    
    //? Validar si los campos están vacíos
    if (Object.values(req.body).includes('')){
        return res.status(400).json({error:'Lo sentimos pero faltan datos'})
    }

    //? Validar si el email existe
    const adminBDD = await administrador.findOne({email})
    if (!adminBDD){
        return res.status(404).json({error:'Lo sentimos, el email no existe'})
    }
    // Actividad 3 (Base de Datos)
    const token = adminBDD.crearToken()
    adminBDD.token = token
    await sendMailToRecoveryPassword(email,token)
    await adminBDD.save()
    // Actividad 4 (Respuesta)
    res.status(200).json({msg:'Correo enviado, verifica tu email'})
}
const comprobarTokenPasword = async (req,res)=>{
    // Actividad 1 (Request)
    const {token} = req.params
    // Actividad 2 (Validaciones)
    //? Validar si el token existe
    if (!token){
        return res.status(400).json({error:'Lo sentimos, no se puede validar el token'})
    }
    //? Validar si el token es correcto
    const adminBDD = await administrador.findOne({token})
    if (!adminBDD){
        return res.status(404).json({error:'Lo sentimos, el token no existe'})
    }
    // Actividad 3 (Base de Datos)
    await adminBDD.save()
    // Actividad 4 (Respuesta)
    res.status(200).json({msg:'Token confirmado, puedes cambiar tu password'})
}
const nuevoPassword = async (req,res)=>{
    // Actividad 1 (Request)
    const {password, confirmpassword} = req.body
    // Actividad 2 (Validaciones)
    //? Validar si los campos están vacíos
    if (Object.values(req.body).includes('')){
        return res.status(400).json({error:'Lo sentimos pero faltan datos'})
    }
    //? Validar si las contraseñas coinciden
    if (password !== confirmpassword){
        return res.status(400).json({error:'Lo sentimos, las contraseñas no coinciden'})
    }
    //? Validar si la contraseña es la misma
    const adminBDD = await administrador.findOne({token:req.params.token})
    if (!adminBDD){
        return res.status(404).json({error:'Lo sentimos, el token no existe'})
    }
    // Actividad 3 (Base de Datos)
    adminBDD.token = null
    adminBDD.password = await adminBDD.encrypPassword(password)
    await adminBDD.save()
    // Actividad 4 (Respuesta)
    res.status(200).json({msg:'Contraseña actualizada, ya puedes iniciar sesión'})
}

export {
    login,
    perfil,
    registro,
    confirmEmail,
    listaradministradores,
    detalleadministrador,
    actualizarPerfil,
    actualizarPassword,
	recuperarPassword,
    comprobarTokenPasword,
	nuevoPassword
}