// src/context/AuthContext.tsx

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
// --- FIX 1: Importar los tipos 'User' y 'Usuario' que necesitamos ---
import { Api, type User, type Usuario } from "../lib/Api";

type UsuarioApp = {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    idtipousuario: number; // ✅ AGREGADO: Campo directo del backend
    tipo_usuario_nombre?: string; // ✅ AGREGADO: Nombre del rol desde el backend
    subtipo?: string; // ✅ AGREGADO: Usado en Reportes.tsx para verificar si es "administrador"
    recibir_notificaciones?: boolean; // ✅ AGREGADO: Usado en PacienteDashboard.tsx
    tipo_usuario: {
        id: number;
        rol: string;
    };
    odontologo?: {
        codusuario: number;
        especialidad: string;
        nromatricula: string;
    };
    paciente?: {
        codusuario: number;
    };
    recepcionista?: {
        codusuario: number;
    };
};

type AuthState = {
    token: string | null;
    user: UsuarioApp | null;
    isAuth: boolean;
    loading: boolean;
    loginFromStorage: () => Promise<void>;
    refreshUser: () => Promise<void>;
    logout: () => void;
    adoptToken: (tk: string, backendUser?: any) => Promise<void>;
    updateNotificationSetting: (newSetting: boolean) => void;
};

const AuthCtx = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UsuarioApp | null>(null);
    const [loading, setLoading] = useState(true);

    const loginFromStorage = async () => {
        console.log("=== LOGIN FROM STORAGE ===");
        const storedToken = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("user_data");

        console.log("Token almacenado:", !!storedToken);
        console.log("UserData almacenado:", storedUser);

        if (!storedToken || !storedUser) {
            setLoading(false);
            return;
        }

        try {
            let userData = JSON.parse(storedUser);
            console.log("UserData parseado:", userData);

            // ✅ MIGRACIÓN: Agregar idtipousuario si no existe (datos antiguos del localStorage)
            if (!userData.idtipousuario && userData.tipo_usuario?.id) {
                console.warn("⚠️ Migrando datos antiguos: agregando idtipousuario desde tipo_usuario.id");
                userData = {
                    ...userData,
                    idtipousuario: userData.tipo_usuario.id
                };
                // Actualizar localStorage con el nuevo formato
                localStorage.setItem("user_data", JSON.stringify(userData));
            }

            setToken(storedToken);
            setUser(userData);
            Api.defaults.headers.common["Authorization"] = `Token ${storedToken}`;

            await Api.get("/auth/verificar-token/");
            console.log("Validación de token exitosa");
        } catch (error) {
            console.error("Error validando token:", error);
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            delete (Api.defaults.headers as any).Authorization;
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loginFromStorage();
    }, []);

    const refreshUser = async () => {
        if (!token) return;
        try {
            const { data } = await Api.get<{ user: Usuario }>("/auth/verificar-token/");
            if (data.user) {
                setUser(data.user);
                localStorage.setItem("user_data", JSON.stringify(data.user));
            }
        } catch (e) {
            console.error("Failed to refresh user", e);
            // ⚠️ NO hacer logout automático aquí - puede ser un error temporal de red
            // El usuario puede seguir usando la app con los datos del localStorage
            console.warn("No se pudo refrescar el usuario, pero mantenemos la sesión activa");
        }
    };

    const logout = () => {
        const tk = token;

        (async () => {
            try {
                // NOTA: No se necesita CSRF, el backend usa Token Authentication
                await Api.post("/auth/logout/", null, {
                    headers: tk ? { Authorization: `Token ${tk}` } : undefined,
                });
            } catch (e) {
                console.warn("No se pudo cerrar sesión en el servidor (continuo limpiando estado):", e);
            }
        })();

        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        delete (Api.defaults.headers as any).Authorization;
        setToken(null);
        setUser(null);
        setLoading(false);
    };

    const adoptToken = async (tk: string, backendUser?: any) => {
        console.log("=== ADOPT TOKEN START ===");
        console.log("Token:", tk);
        console.log("Backend User Data:", backendUser);

        setLoading(true);

        try {
            localStorage.setItem("auth_token", tk);
            setToken(tk);
            Api.defaults.headers.common["Authorization"] = `Token ${tk}`;

            if (backendUser) {
                console.log("Mapeando datos del backend al formato frontend");
                
                // Mapear estructura del backend al formato UsuarioApp
                const mappedUser: UsuarioApp = {
                    id: backendUser.codigo,
                    email: backendUser.correoelectronico,
                    nombre: backendUser.nombre,
                    apellido: backendUser.apellido,
                    idtipousuario: backendUser.idtipousuario, // ✅ AGREGADO: Campo directo para checks de roles
                    tipo_usuario_nombre: backendUser.tipo_usuario_nombre, // ✅ AGREGADO: Nombre del rol
                    tipo_usuario: {
                        id: backendUser.idtipousuario,
                        rol: backendUser.tipo_usuario_nombre || backendUser.subtipo || "Usuario"
                    },
                    // Campos opcionales según el tipo de usuario
                    ...(backendUser.odontologo && { odontologo: backendUser.odontologo }),
                    ...(backendUser.paciente && { paciente: backendUser.paciente }),
                    ...(backendUser.recepcionista && { recepcionista: backendUser.recepcionista })
                };

                console.log("Usuario mapeado:", mappedUser);
                setUser(mappedUser);
                localStorage.setItem("user_data", JSON.stringify(mappedUser));
                console.log("Usuario guardado en localStorage");
            } else {
                console.log("Sin datos de usuario, refrescando...");
                await refreshUser();
            }
        } catch (error) {
            console.error("Error en adoptToken:", error);
        } finally {
            setLoading(false);
            console.log("=== ADOPT TOKEN END ===");
        }
    };

    const updateNotificationSetting = useCallback((newSetting: boolean) => {
        // Esta función puede mantenerse para compatibilidad pero no hace nada
        // ya que el nuevo backend no tiene este campo
        console.log("Configuración de notificaciones:", newSetting);
    }, []);

    const value: AuthState = useMemo(
        () => ({
            token,
            user,
            isAuth: !!token && !!user,
            loading,
            loginFromStorage,
            refreshUser,
            logout,
            adoptToken,
            // --- FIX 4: Añadimos la función al objeto del contexto ---
            updateNotificationSetting
        }),
        [token, user, loading, updateNotificationSetting]
    );

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = (): AuthState => {
    const ctx = useContext(AuthCtx);
    if (ctx) return ctx;

    // --- FIX 5: Añadimos la función al objeto de retorno por defecto ---
    // Esto evita errores si el contexto no se encuentra
    return {
        token: null,
        user: null,
        isAuth: false,
        loading: false,
        loginFromStorage: async () => {},
        refreshUser: async () => {},
        logout: () => {},
        adoptToken: async () => {},
        updateNotificationSetting: () => {}, // Función vacía por defecto
    };
};







