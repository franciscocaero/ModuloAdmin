import {Router} from 'express'
import {
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
} from "../controllers/admin_controller.js";

import verificarAutenticacion from "../middlewares/autenticacion.js";

const router= Router();
router.post("/login", login);
router.post("/registro", registro);
router.get("/confirmar/:token", confirmEmail);
router.get("/administradores", listaradministradores);
router.get("/recuperar-password", recuperarPassword);
router.get("/recuperar-password/:token", comprobarTokenPasword);
router.post("/nuevo-password/:token", nuevoPassword);

router.get("/perfil", verificarAutenticacion , perfil);
router.put('/administrador/actualizarpassword',verificarAutenticacion,actualizarPassword)
router.get("/administrador/:id",verificarAutenticacion, detalleadministrador);
router.put("/administrador/:id",verificarAutenticacion ,actualizarPerfil);


export default router