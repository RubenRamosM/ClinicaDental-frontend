// src/router.tsx
import {createBrowserRouter} from "react-router-dom";
import {Root} from "./Root";
import Home from "./pages/Home";
import RegisterPatientForm from "./pages/RegisterPatientForm";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AgendarCita from "./pages/AgendarCita";
import AgendarCitaConPago from "./pages/AgendarCitaConPago";
import ProtectedRoute from "./components/ProtectedRoute";
import MisCitas from "./pages/MisCitas";
import Agenda from "./pages/Agenda";
import ForgotPassword from "./pages/Forgot-Password";
import ResetPassword from "./pages/ResetPassword";
import GestionRoles from "./pages/GestionRoles";
import Perfil from "./pages/Perfil";
import RegistrarHistoriaClinica from "./pages/RegistrarHistoriaClinica";
import UsuariosySeguridad from "./components/UsuariosySeguridad";
import ConsultarHistoriaClinica from "./pages/ConsultarHistoriaClinica";
import ConsultarHistoriaClinicaPaciente from "./pages/ConsultarHistoriaClinicaPaciente";
import PolticasNoShow from "./pages/CrearPoliticaNoShow";
import Reportes from "./pages/Reportes";
import LandingCompra from "./pages/LandingCompra";
import CrearUsuario from "./pages/CrearUsuario";
import CatalogoServicios from "./pages/CatalogoServicios";
import ListarPlanesTratamiento from "./pages/ListarPlanesTratamiento";
import CrearPlanTratamiento from "./pages/CrearPlanTratamiento";
import DetallePlanTratamiento from "./pages/DetallePlanTratamiento";
import EditarPlanTratamiento from "./pages/EditarPlanTratamiento";
import AgregarItemPlan from "./pages/AgregarItemPlan";
import ListarPresupuestosDigitales from "./pages/ListarPresupuestosDigitales";
import CrearPresupuestoDigital from "./pages/CrearPresupuestoDigital";
import DetallePresupuestoDigital from "./pages/DetallePresupuestoDigital";
import MisPresupuestosPaciente from "./pages/MisPresupuestosPaciente";
import AceptarPresupuesto from "./pages/AceptarPresupuesto";
// import ListarCombos from "./pages/ListarCombos"; // ❌ ELIMINADO - Combos removidos del sistema
// import CrearEditarCombo from "./pages/CrearEditarCombo"; // ❌ ELIMINADO
// import DetalleCombo from "./pages/DetalleCombo"; // ❌ ELIMINADO
import ListarSesionesPlan from "./pages/ListarSesionesPlan";
import RegistrarSesion from "./pages/RegistrarSesion";
import EditarSesion from "./pages/EditarSesion";
import HistorialSesionesPaciente from "./pages/HistorialSesionesPaciente";

// ============================================
// PRESUPUESTOS Y PAGOS - Sistema unificado
// ============================================
import MisPresupuestos from "./pages/MisPresupuestos";
import MiPlanTratamiento from "./pages/MiPlanTratamiento";
import RespaldosPage from "./pages/Respaldos";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Root/>,
        children: [
            // Página de inicio simple
            {index: true, element: <Home/>},

            // Públicas
            {path: "/login", element: <Login/>},
            {path: "/register", element: <RegisterPatientForm/>},
            {path: "/forgot-password", element: <ForgotPassword/>},
            {path: "/reset-password", element: <ResetPassword/>},

            // Protegidas (requieren sesión)
            {
                path: "/dashboard",
                element: (
                    <ProtectedRoute>
                        <Dashboard/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/agenda",
                element: (
                    <ProtectedRoute>
                        <Agenda/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/agendar-cita",
                element: (
                    <ProtectedRoute>
                        <AgendarCita/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/agendar-cita-con-pago",
                element: (
                    <ProtectedRoute>
                        <AgendarCitaConPago/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/mis-citas",
                element: (
                    <ProtectedRoute>
                        <MisCitas/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/perfil",
                element: (
                    <ProtectedRoute>
                        <Perfil/>
                    </ProtectedRoute>
                ),
            },

            // Administración (protegida; backend valida si es admin)
            {
                path: "/usuarios",
                element: (
                    <ProtectedRoute>
                        <GestionRoles/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/crear-usuario",
                element: (
                    <ProtectedRoute>
                        <CrearUsuario/>
                    </ProtectedRoute>
                ),
            },

             {
                path: "/politicanoshow",
                element: (
                    <ProtectedRoute>
                        <PolticasNoShow/>
                    </ProtectedRoute>
                ),
            },


            //Registrar Historia Clínica (protegida)
            {
                path: "/historias/registrar",
                element: (
                    <ProtectedRoute>
                        <RegistrarHistoriaClinica/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/registrar-historia-clinica",
                element: (
                    <ProtectedRoute>
                        <RegistrarHistoriaClinica/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/historias/consultar",
                element: (
                    <ProtectedRoute>
                        <ConsultarHistoriaClinica/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/consultar-historia-clinica",
                element: (
                    <ProtectedRoute>
                        <ConsultarHistoriaClinica/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/usuarios-seguridad",
                element: (
                    <ProtectedRoute>
                        {/* Si usas AdminRoute, envuelve: <AdminRoute> ... </AdminRoute> */}
                        <UsuariosySeguridad/>
                    </ProtectedRoute>
                )
            },
            {
                path: "/mis-historias",
                element: (
                    <ProtectedRoute>
                        <ConsultarHistoriaClinicaPaciente/>
                    </ProtectedRoute>
                ),
            },

            // Reportes (protegida - solo administradores)
            {
                path: "/reportes",
                element: (
                    <ProtectedRoute>
                        <Reportes/>
                    </ProtectedRoute>
                ),
            },

            // Respaldos (protegida - solo administradores)
            {
                path: "/respaldos",
                element: (
                    <ProtectedRoute allowedRoleIds={[1]}>
                        <RespaldosPage/>
                    </ProtectedRoute>
                ),
            },

            // Planes de Tratamiento (protegidas)
            {
                path: "/planes-tratamiento",
                element: (
                    <ProtectedRoute>
                        <ListarPlanesTratamiento/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/planes-tratamiento/crear",
                element: (
                    <ProtectedRoute>
                        <CrearPlanTratamiento/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/planes-tratamiento/:id",
                element: (
                    <ProtectedRoute>
                        <DetallePlanTratamiento/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/planes-tratamiento/:id/editar",
                element: (
                    <ProtectedRoute>
                        <EditarPlanTratamiento/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/planes-tratamiento/:id/agregar-item",
                element: (
                    <ProtectedRoute>
                        <AgregarItemPlan/>
                    </ProtectedRoute>
                ),
            },

            // Catálogo de Servicios (protegida - Pacientes, Odontólogos y Administradores)
            // ✅ IDs fijos: 1=Administrador, 2=Odontólogo, 3=Recepcionista, 4=Paciente
            {
                path: "/catalogo-servicios",
                element: (
                    <ProtectedRoute allowedRoleIds={[4, 2, 1]}>
                        <CatalogoServicios/>
                    </ProtectedRoute>
                ),
            },

            // Presupuestos Digitales (protegidas - Solo Odontólogos y Administradores)
            {
                path: "/presupuestos-digitales",
                element: (
                    <ProtectedRoute allowedRoleIds={[1, 2]}>
                        <ListarPresupuestosDigitales/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/presupuestos-digitales/crear",
                element: (
                    <ProtectedRoute allowedRoleIds={[1, 2]}>
                        <CrearPresupuestoDigital/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/presupuestos-digitales/:id",
                element: (
                    <ProtectedRoute allowedRoleIds={[1, 2]}>
                        <DetallePresupuestoDigital/>
                    </ProtectedRoute>
                ),
            },

            // ============================================
            // SISTEMA UNIFICADO: Presupuestos + Pagos
            // ============================================
            
            // PASO 1: Ver presupuestos digitales pendientes de aceptación
            {
                path: "/mis-presupuestos",
                element: (
                    <ProtectedRoute allowedRoleIds={[4]}>
                        <MisPresupuestos/>
                    </ProtectedRoute>
                ),
            },
            
            // PASO 2: Aceptar presupuesto con firma digital
            {
                path: "/presupuestos/:id/aceptar",
                element: (
                    <ProtectedRoute allowedRoleIds={[4]}>
                        <AceptarPresupuesto/>
                    </ProtectedRoute>
                ),
            },
            
            // PASO 3: Ver mi plan de tratamiento (incluye historial de pagos + registrar pago)
            {
                path: "/mi-plan/:planId",
                element: (
                    <ProtectedRoute allowedRoleIds={[4, 3, 1]}>
                        <MiPlanTratamiento/>
                    </ProtectedRoute>
                ),
            },
            
            // LEGACY: Redirecciones para compatibilidad con rutas antiguas
            {
                path: "/historial-pagos/:planId",
                element: (
                    <ProtectedRoute allowedRoleIds={[4, 3, 1]}>
                        <MiPlanTratamiento/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/registrar-pago",
                element: (
                    <ProtectedRoute allowedRoleIds={[3, 1]}>
                        <MiPlanTratamiento/>
                    </ProtectedRoute>
                ),
            },

            // ❌ COMBOS DESHABILITADOS - Sistema removido del frontend
            // {
            //     path: "/combos",
            //     element: (
            //         <ProtectedRoute>
            //             <ListarCombos/>
            //         </ProtectedRoute>
            //     ),
            // },
            // {
            //     path: "/combos/nuevo",
            //     element: (
            //         <ProtectedRoute>
            //             <CrearEditarCombo/>
            //         </ProtectedRoute>
            //     ),
            // },
            // {
            //     path: "/combos/:id",
            //     element: (
            //         <ProtectedRoute>
            //             <DetalleCombo/>
            //         </ProtectedRoute>
            //     ),
            // },
            // {
            //     path: "/combos/:id/editar",
            //     element: (
            //         <ProtectedRoute>
            //             <CrearEditarCombo/>
            //         </ProtectedRoute>
            //     ),
            // },

            // Sesiones de Tratamiento (protegidas - Odontólogos y Administradores)
            {
                path: "/planes/:planId/sesiones",
                element: (
                    <ProtectedRoute allowedRoleIds={[189, 190]}>
                        <ListarSesionesPlan/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/planes/:planId/registrar-sesion",
                element: (
                    <ProtectedRoute allowedRoleIds={[189, 190]}>
                        <RegistrarSesion/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/sesiones/:sesionId/editar",
                element: (
                    <ProtectedRoute allowedRoleIds={[189, 190]}>
                        <EditarSesion/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/pacientes/:pacienteId/historial-sesiones",
                element: (
                    <ProtectedRoute allowedRoleIds={[189, 190]}>
                        <HistorialSesionesPaciente/>
                    </ProtectedRoute>
                ),
            },

            // 404
            {
                path: "*",
                element: <div className="min-h-screen grid place-items-center">404</div>,
            },
        ],
    },
]);







