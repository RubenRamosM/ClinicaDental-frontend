// src/components/LoginBackend.tsx
import { useEffect, useRef } from "react";
import { Api } from "../lib/Api";
import axios, { AxiosError } from "axios";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginSuccess = {
  mensaje: string;
  token: string;
  usuario: {
    codigo: number;
    nombre: string;
    apellido: string;
    correoelectronico: string;
    sexo?: string;
    telefono?: string;
    idtipousuario: number;
    tipo_usuario_nombre: string;
    nombre_completo: string;
    recibir_notificaciones: boolean;
    notificaciones_email: boolean;
    notificaciones_push: boolean;
    paciente?: any;
  };
};

export type LoginError = {
  status?: number;
  detail?: string;
  fields?: Record<string, string>;
  serverError?: boolean;
  networkError?: boolean;
};

type Props = {
  /** Cuando pase de null a objeto, se dispara el login */
  payload: LoginPayload | null;
  onDone: (
      result:
          | { ok: true; data: LoginSuccess }
          | { ok: false; error: LoginError }
  ) => void;
};

/** Componente "backend" (sin UI): hace login real a /auth/login/ */
export default function LoginBackend({ payload, onDone }: Props): null {
  const isProcessingRef = useRef(false);
  const lastPayloadRef = useRef<LoginPayload | null>(null);

  useEffect(() => {
    // Guard 1: No hay payload
    if (!payload) {
      console.log("LoginBackend: No payload");
      return;
    }

    // Guard 2: Ya está procesando
    if (isProcessingRef.current) {
      console.log("LoginBackend: Ya procesando, ignorando...");
      return;
    }

    // Guard 3: Mismo payload que antes (evitar duplicados)
    if (lastPayloadRef.current &&
        lastPayloadRef.current.email === payload.email &&
        lastPayloadRef.current.password === payload.password) {
      console.log("LoginBackend: Mismo payload, ignorando duplicado");
      return;
    }

    console.log("LoginBackend: Procesando login para", payload.email);
    isProcessingRef.current = true;
    lastPayloadRef.current = payload;

    (async () => {
      try {
        // Body para login
        // IMPORTANTE: El backend espera 'correo' NO 'email'
        const body = {
          correo: payload.email,  // El backend usa 'correo' en lugar de 'email'
          password: payload.password,
        };

        const loginUrl = "/auth/login/";
        console.log("LoginBackend: Enviando login a", loginUrl);
        console.log("LoginBackend: Payload:", { email: payload.email, password: "[OCULTA]" });
        console.log("LoginBackend: Body completo (JSON):", JSON.stringify(body));

        const { data } = await Api.post<LoginSuccess>(loginUrl, body);

        console.log("=== RESPUESTA COMPLETA DEL SERVIDOR ===");
        console.log("Data completa:", data);
        console.log("Tipo de data:", typeof data);
        console.log("Claves en data:", Object.keys(data || {}));
        console.log("data.token:", data?.token);
        console.log("data.usuario:", data?.usuario);
        console.log("data.usuario.idtipousuario:", data?.usuario?.idtipousuario);
        console.log("=== FIN RESPUESTA ===");

        console.log("✅ LoginBackend: Login exitoso. Token recibido:", data.token);

        // Validar que la respuesta tenga la estructura esperada
        if (!data.token || !data.usuario) {
          console.error("❌ LoginBackend: Respuesta incompleta del servidor");
          throw new Error("Respuesta incompleta del servidor");
        }

        onDone({ ok: true, data });
      } catch (err: unknown) {
        console.error("LoginBackend: Error en login", err);
        const error: LoginError = {};

        if (axios.isAxiosError(err)) {
          const ax = err as AxiosError<any>;
          error.status = ax.response?.status;

          console.log("LoginBackend: Detalles del error:");
          console.log("- Status:", ax.response?.status);
          console.log("- Status Text:", ax.response?.statusText);
          console.log("- Response Headers:", ax.response?.headers);
          console.log("- Response Data:", ax.response?.data);
          console.log("- Response Data (stringified):", JSON.stringify(ax.response?.data, null, 2));
          console.log("- Request URL:", ax.config?.url);
          console.log("- Request Method:", ax.config?.method);
          console.log("- Request Data (sent):", ax.config?.data);

          // Manejar errores específicos del servidor
          if (ax.response?.status === 500) {
            error.serverError = true;
            error.detail = "Error interno del servidor. Por favor, contacta al administrador del sistema.";
            console.error("LoginBackend: Error 500 - Problema en el servidor backend");
          } else if (ax.response?.status === 503) {
            error.serverError = true;
            error.detail = "Servicio temporalmente no disponible. Intenta nuevamente en unos minutos.";
          } else if (ax.response?.status === 502 || ax.response?.status === 504) {
            error.serverError = true;
            error.detail = "Error de conectividad con el servidor. Verifica tu conexión a internet.";
          } else if (!ax.response) {
            // Error de red
            error.networkError = true;
            error.detail = "No se pudo conectar al servidor. Verifica tu conexión a internet.";
          } else {
            // Intentar extraer información del error
            const d = ax.response?.data;
            if (d && typeof d === 'object') {
              // Respuesta JSON válida
              error.detail = typeof d["detail"] === "string" ? (d["detail"] as string) : undefined;
              const fields: Record<string, string> = {};
              Object.keys(d).forEach((k) => {
                if (k === "detail") return;
                const v = d[k];
                if (Array.isArray(v)) fields[k] = (v as unknown[]).join(" ");
                else if (typeof v === "string") fields[k] = v;
              });
              if (Object.keys(fields).length) error.fields = fields;
            } else if (typeof d === 'string' && d.includes('<!doctype html>')) {
              // Página HTML de error
              error.serverError = true;
              error.detail = `Error del servidor (${ax.response.status}). El backend devolvió una página de error en lugar de datos JSON.`;
            } else {
              error.detail = ax.message || "Error de comunicación con el servidor";
            }
          }
        } else {
          error.detail = "Error desconocido en la conexión";
          console.error("LoginBackend: Error no-axios:", err);
        }

        onDone({ ok: false, error });
      } finally {
        // Liberar el flag después de un pequeño delay para evitar race conditions
        setTimeout(() => {
          isProcessingRef.current = false;
          console.log("LoginBackend: Proceso completado");
        }, 100);
      }
    })();
  }, [payload, onDone]);

  return null;
}






