import Swal from "sweetalert2"

// Configuración base para SweetAlert2
const baseConfig = {
  customClass: {
    popup: "rounded-xl shadow-2xl",
    title: "text-xl font-bold",
    content: "text-gray-600",
    confirmButton: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg",
    cancelButton: "bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg",
  },
  buttonsStyling: false,
}

// Alerta de éxito
export const showSuccessAlert = (title: string, text: string) => {
  return Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: "success",
    timer: 3000,
    showConfirmButton: false,
    toast: true,
    position: "top-end",
    timerProgressBar: true,
  })
}

// Alerta de error
export const showErrorAlert = (title: string, text: string) => {
  return Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: "error",
    confirmButtonText: "Entendido",
    customClass: {
      ...baseConfig.customClass,
      confirmButton: "bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg",
    },
  })
}

// Alerta de advertencia
export const showWarningAlert = (title: string, text: string) => {
  return Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: "warning",
    confirmButtonText: "Entendido",
    customClass: {
      ...baseConfig.customClass,
      confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg",
    },
  })
}

// Diálogo de confirmación
export const showConfirmDialog = (title: string, text: string, confirmText = "Confirmar", cancelText = "Cancelar") => {
  return Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      ...baseConfig.customClass,
      confirmButton: "bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg",
      cancelButton: "bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg",
    },
  }).then((result) => result.isConfirmed)
}

// Alerta de información
export const showInfoAlert = (title: string, text: string) => {
  return Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: "info",
    confirmButtonText: "Entendido",
  })
}

// Alerta de carga
export const showLoadingAlert = (title: string, text: string) => {
  return Swal.fire({
    ...baseConfig,
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })
}

// Cerrar alerta de carga
export const closeLoadingAlert = () => {
  Swal.close()
}

// Toast personalizado
export const showToast = (
  message: string,
  type: "success" | "error" | "warning" | "info" = "info",
  duration = 3000,
) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: duration,
    timerProgressBar: true,
    icon: type,
    title: message,
    customClass: {
      popup: "rounded-lg shadow-lg",
    },
  })
}

// Modal de confirmación para eliminar
export const showDeleteConfirmation = async (
  title = "¿Eliminar registro?",
  text = "Esta acción no se puede deshacer",
  confirmButtonText = "Sí, eliminar",
) => {
  const result = await Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
    focusCancel: true,
  })
  return result.isConfirmed
}

// Modal de confirmación para actualizar
export const showUpdateConfirmation = async (
  title = "¿Guardar cambios?",
  text = "Se actualizarán los datos del registro",
  confirmButtonText = "Sí, guardar",
) => {
  const result = await Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
  })
  return result.isConfirmed
}

// Modal de edición de Ave con SweetAlert2 - CORREGIDO
export const showEditAveModal = async (ave: any, jaulas: any[]) => {
  const jaulasOptions = jaulas
    .map(
      (jaula) =>
        `<option value="${jaula.id_jaula}" ${ave.id_jaula === jaula.id_jaula ? "selected" : ""}>${jaula.numero_jaula || "Jaula"} - ${jaula.descripcion}</option>`,
    )
    .join("")

  const { value: formValues } = await Swal.fire({
    title: `✏️ Editar Ave #${ave.id_ave}`,
    html: `
      <div class="swal-form">
        <div class="swal-form-group">
          <label class="swal-label">🏷️ ID Anillo *</label>
          <input id="id_anillo" class="swal-input" type="text" value="${ave.id_anillo || ""}" placeholder="Ej: A001" required>
        </div>
        
        <div class="swal-form-group">
          <label class="swal-label">🎨 Color Anillo</label>
          <input id="color_anillo" class="swal-input" type="text" value="${ave.color_anillo || ""}" placeholder="Ej: Rojo">
        </div>
        
        <div class="swal-form-group">
          <label class="swal-label">📅 Edad</label>
          <input id="edad" class="swal-input" type="text" value="${ave.edad || ""}" placeholder="Ej: 6 meses">
        </div>
        
        <div class="swal-form-group">
          <label class="swal-label">🧬 Raza</label>
          <input id="raza" class="swal-input" type="text" value="${ave.raza || ""}" placeholder="Ej: Rhode Island Red">
        </div>
        
        <div class="swal-form-group">
          <label class="swal-label">🥚 Estado de Puesta</label>
          <select id="estado_puesta" class="swal-select">
            <option value="activa" ${ave.estado_puesta === "activa" ? "selected" : ""}>🥚 Activa</option>
            <option value="inactiva" ${ave.estado_puesta === "inactiva" ? "selected" : ""}>❌ Inactiva</option>
            <option value="en_desarrollo" ${ave.estado_puesta === "en_desarrollo" ? "selected" : ""}>🐣 En desarrollo</option>
          </select>
        </div>
        
        <div class="swal-form-group">
          <label class="swal-label">🏠 Jaula</label>
          <select id="id_jaula" class="swal-select">
            <option value="">Seleccionar jaula</option>
            ${jaulasOptions}
          </select>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "💾 Guardar Cambios",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#6b7280",
    width: "500px",
    customClass: {
      popup: "swal-wide-popup",
    },
    focusConfirm: false,
    preConfirm: () => {
      const id_anillo = (document.getElementById("id_anillo") as HTMLInputElement)?.value?.trim()
      const color_anillo = (document.getElementById("color_anillo") as HTMLInputElement)?.value?.trim()
      const edad = (document.getElementById("edad") as HTMLInputElement)?.value?.trim()
      const raza = (document.getElementById("raza") as HTMLInputElement)?.value?.trim()
      const estado_puesta = (document.getElementById("estado_puesta") as HTMLSelectElement)?.value
      const id_jaula = (document.getElementById("id_jaula") as HTMLSelectElement)?.value

      if (!id_anillo) {
        Swal.showValidationMessage("❌ El ID del anillo es requerido")
        return false
      }

      if (id_anillo.length > 10) {
        Swal.showValidationMessage("❌ El ID del anillo no puede tener más de 10 caracteres")
        return false
      }

      return {
        id_anillo,
        color_anillo: color_anillo || null,
        edad: edad || null,
        raza: raza || null,
        estado_puesta,
        id_jaula: id_jaula ? Number(id_jaula) : null,
      }
    },
  })

  return formValues
}

// Modal de edición de Huevo con SweetAlert2 - CORREGIDO
export const showEditHuevoModal = async (huevo: any, jaulas: any[]) => {
  const jaulasOptions = jaulas
    .map(
      (jaula) =>
        `<option value="${jaula.id_jaula}" ${huevo.id_jaula === jaula.id_jaula ? "selected" : ""}>${jaula.numero_jaula || "Jaula"} - ${jaula.descripcion}</option>`,
    )
    .join("")

  const { value: formValues } = await Swal.fire({
    title: `🥚 Editar Registro #${huevo.id_huevo}`,
    html: `
      <div class="swal-form">
        <div class="swal-form-row">
          <div class="swal-form-group">
            <label class="swal-label">🏠 Jaula</label>
            <select id="id_jaula" class="swal-select">
              <option value="">Seleccionar jaula</option>
              ${jaulasOptions}
            </select>
          </div>
          
          <div class="swal-form-group">
            <label class="swal-label">📊 Cantidad Total</label>
            <input id="cantidad_total" class="swal-input" type="number" min="0" value="${huevo.cantidad_total || 0}" placeholder="0">
          </div>
        </div>
        
        <div class="swal-section">
          <h4 class="swal-section-title">🟤 Huevos Café</h4>
          <div class="swal-form-row-4">
            <div class="swal-form-group">
              <label class="swal-label">Chico</label>
              <input id="huevos_cafe_chico" class="swal-input" type="number" min="0" value="${huevo.huevos_cafe_chico || 0}">
            </div>
            <div class="swal-form-group">
              <label class="swal-label">Mediano</label>
              <input id="huevos_cafe_mediano" class="swal-input" type="number" min="0" value="${huevo.huevos_cafe_mediano || 0}">
            </div>
            <div class="swal-form-group">
              <label class="swal-label">Grande</label>
              <input id="huevos_cafe_grande" class="swal-input" type="number" min="0" value="${huevo.huevos_cafe_grande || 0}">
            </div>
            <div class="swal-form-group">
              <label class="swal-label">Jumbo</label>
              <input id="huevos_cafe_jumbo" class="swal-input" type="number" min="0" value="${huevo.huevos_cafe_jumbo || 0}">
            </div>
          </div>
        </div>
        
        <div class="swal-section">
          <h4 class="swal-section-title">⚪ Huevos Blancos</h4>
          <div class="swal-form-row-4">
            <div class="swal-form-group">
              <label class="swal-label">Chico</label>
              <input id="huevos_blanco_chico" class="swal-input" type="number" min="0" value="${huevo.huevos_blanco_chico || 0}">
            </div>
            <div class="swal-form-group">
              <label class="swal-label">Mediano</label>
              <input id="huevos_blanco_mediano" class="swal-input" type="number" min="0" value="${huevo.huevos_blanco_mediano || 0}">
            </div>
            <div class="swal-form-group">
              <label class="swal-label">Grande</label>
              <input id="huevos_blanco_grande" class="swal-input" type="number" min="0" value="${huevo.huevos_blanco_grande || 0}">
            </div>
            <div class="swal-form-group">
              <label class="swal-label">Jumbo</label>
              <input id="huevos_blanco_jumbo" class="swal-input" type="number" min="0" value="${huevo.huevos_blanco_jumbo || 0}">
            </div>
          </div>
        </div>
        
        <div class="swal-form-group">
          <label class="swal-label">📝 Observaciones</label>
          <textarea id="observaciones" class="swal-textarea" rows="3" placeholder="Observaciones adicionales...">${huevo.observaciones || ""}</textarea>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "💾 Guardar Cambios",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#6b7280",
    width: "700px",
    customClass: {
      popup: "swal-wide-popup",
    },
    focusConfirm: false,
    preConfirm: () => {
      const id_jaula = (document.getElementById("id_jaula") as HTMLSelectElement)?.value
      const cantidad_total = (document.getElementById("cantidad_total") as HTMLInputElement)?.value
      const huevos_cafe_chico = (document.getElementById("huevos_cafe_chico") as HTMLInputElement)?.value
      const huevos_cafe_mediano = (document.getElementById("huevos_cafe_mediano") as HTMLInputElement)?.value
      const huevos_cafe_grande = (document.getElementById("huevos_cafe_grande") as HTMLInputElement)?.value
      const huevos_cafe_jumbo = (document.getElementById("huevos_cafe_jumbo") as HTMLInputElement)?.value
      const huevos_blanco_chico = (document.getElementById("huevos_blanco_chico") as HTMLInputElement)?.value
      const huevos_blanco_mediano = (document.getElementById("huevos_blanco_mediano") as HTMLInputElement)?.value
      const huevos_blanco_grande = (document.getElementById("huevos_blanco_grande") as HTMLInputElement)?.value
      const huevos_blanco_jumbo = (document.getElementById("huevos_blanco_jumbo") as HTMLInputElement)?.value
      const observaciones = (document.getElementById("observaciones") as HTMLTextAreaElement)?.value

      return {
        id_jaula: id_jaula ? Number(id_jaula) : null,
        cantidad_total: Number(cantidad_total) || 0,
        huevos_cafe_chico: Number(huevos_cafe_chico) || 0,
        huevos_cafe_mediano: Number(huevos_cafe_mediano) || 0,
        huevos_cafe_grande: Number(huevos_cafe_grande) || 0,
        huevos_cafe_jumbo: Number(huevos_cafe_jumbo) || 0,
        huevos_blanco_chico: Number(huevos_blanco_chico) || 0,
        huevos_blanco_mediano: Number(huevos_blanco_mediano) || 0,
        huevos_blanco_grande: Number(huevos_blanco_grande) || 0,
        huevos_blanco_jumbo: Number(huevos_blanco_jumbo) || 0,
        observaciones: observaciones?.trim() || null,
      }
    },
  })

  return formValues
}

// Modal de edición de Cliente con SweetAlert2
export const showEditClienteModal = async (cliente: any) => {
  const { value: formValues } = await Swal.fire({
    title: `👤 Editar Cliente #${cliente.id_cliente}`,
    html: `
      <div class="swal-form">
        <div class="swal-form-group">
          <label class="swal-label">👤 Nombre *</label>
          <input id="nombre" class="swal-input" type="text" value="${cliente.nombre || ""}" placeholder="Nombre completo" required>
        </div>
        
        <div class="swal-form-group">
          <label class="swal-label">📍 Dirección</label>
          <textarea id="direccion" class="swal-textarea" rows="2" placeholder="Dirección completa">${cliente.direccion || ""}</textarea>
        </div>
        
        <div class="swal-form-group">
          <label class="swal-label">📞 Teléfono</label>
          <input id="telefono" class="swal-input" type="tel" value="${cliente.telefono || ""}" placeholder="Número de teléfono">
        </div>
        
        <div class="swal-form-group">
          <label class="swal-label">🏷️ Tipo de Cliente</label>
          <select id="tipo_cliente" class="swal-select">
            <option value="Mayorista" ${cliente.tipo_cliente === "Mayorista" ? "selected" : ""}>🏢 Mayorista</option>
            <option value="Minorista" ${cliente.tipo_cliente === "Minorista" ? "selected" : ""}>🛒 Minorista</option>
          </select>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "💾 Guardar Cambios",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#6b7280",
    width: "500px",
    customClass: {
      popup: "swal-wide-popup",
    },
    focusConfirm: false,
    preConfirm: () => {
      const nombre = (document.getElementById("nombre") as HTMLInputElement)?.value?.trim()
      const direccion = (document.getElementById("direccion") as HTMLTextAreaElement)?.value?.trim()
      const telefono = (document.getElementById("telefono") as HTMLInputElement)?.value?.trim()
      const tipo_cliente = (document.getElementById("tipo_cliente") as HTMLSelectElement)?.value

      if (!nombre) {
        Swal.showValidationMessage("❌ El nombre es requerido")
        return false
      }

      return {
        nombre,
        direccion: direccion || null,
        telefono: telefono || null,
        tipo_cliente,
      }
    },
  })

  return formValues
}

// Configuración base para alertas de sesión
const sessionBaseConfig = {
  customClass: {
    popup: "rounded-xl shadow-2xl",
    title: "text-xl font-bold",
    content: "text-gray-600",
    confirmButton: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg",
    cancelButton: "bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg",
  },
  buttonsStyling: false,
}

// Alerta de sesión expirada por inactividad
export const showSessionExpiredAlert = () => {
  return Swal.fire({
    ...sessionBaseConfig,
    title: "⏰ Sesión Expirada",
     text: "Tu sesión ha expirado por inactividad (5 minutos sin actividad)",
    icon: "warning",
    confirmButtonText: "Ir al Login",
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      ...sessionBaseConfig.customClass,
      confirmButton: "bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg",
    },
  })
}

// Modal de advertencia de sesión con countdown
export const showSessionWarningAlert = (countdown: number) => {
  return Swal.fire({
    ...sessionBaseConfig,
    title: "⚠️ Sesión por Expirar",
    html: `
      <div class="text-center">
        <p class="text-gray-600 mb-4">Tu sesión expirará por inactividad en:</p>
        <div class="text-3xl font-bold text-red-600 mb-4" id="countdown-display">${countdown}</div>
        <p class="text-sm text-gray-500">¿Deseas continuar con tu sesión?</p>
      </div>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "✅ Continuar Sesión",
    cancelButtonText: "🚪 Cerrar Sesión",
    allowOutsideClick: false,
    allowEscapeKey: false,
    reverseButtons: true,
    customClass: {
      ...sessionBaseConfig.customClass,
      confirmButton: "bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg",
      cancelButton: "bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg",
    },
    didOpen: () => {
      const countdownElement = document.getElementById("countdown-display")
      let timeLeft = countdown

      const interval = setInterval(() => {
        timeLeft -= 1
        if (countdownElement) {
          countdownElement.textContent = `${timeLeft}s`
        }

        if (timeLeft <= 0) {
          clearInterval(interval)
          Swal.close()
        }
      }, 1000)

      // Limpiar interval si se cierra el modal
      Swal.getPopup()?.addEventListener("DOMNodeRemoved", () => {
        clearInterval(interval)
      })
    },
  })
}

// Toast de advertencia de inactividad
export const showInactivityToast = (minutesLeft: number) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    icon: "warning",
    title: `⚠️ ${minutesLeft} min${minutesLeft > 1 ? "utos" : "uto"} para cierre automático`,
    customClass: {
      popup: "rounded-lg shadow-lg",
    },
  })
}

// Alerta de sesión restaurada
export const showSessionRestoredToast = () => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: "success",
    title: "✅ Sesión restaurada correctamente",
    customClass: {
      popup: "rounded-lg shadow-lg",
    },
  })
}

// Alerta de token verificado
export const showTokenVerifiedToast = () => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    icon: "info",
    title: "🔄 Token verificado",
    customClass: {
      popup: "rounded-lg shadow-lg",
    },
  })
}
