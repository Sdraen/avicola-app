import Swal from "sweetalert2"

// Configuración base para SweetAlert2
const swalConfig = {
  customClass: {
    popup: "swal-popup",
    title: "swal-title",
    content: "swal-content",
    confirmButton: "swal-confirm-btn",
    cancelButton: "swal-cancel-btn",
  },
  buttonsStyling: false,
}

// Modal de confirmación para eliminar
export const showDeleteConfirmation = async (
  title = "¿Eliminar registro?",
  text = "Esta acción no se puede deshacer",
  confirmButtonText = "Sí, eliminar",
) => {
  return await Swal.fire({
    ...swalConfig,
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
}

// Modal de confirmación para actualizar
export const showUpdateConfirmation = async (
  title = "¿Guardar cambios?",
  text = "Se actualizarán los datos del registro",
  confirmButtonText = "Sí, guardar",
) => {
  return await Swal.fire({
    ...swalConfig,
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
}

// Modal de éxito
export const showSuccessAlert = async (
  title = "¡Éxito!",
  text = "Operación completada correctamente",
  timer = 2000,
) => {
  return await Swal.fire({
    ...swalConfig,
    title,
    text,
    icon: "success",
    timer,
    showConfirmButton: false,
    timerProgressBar: true,
  })
}

// Modal de error
export const showErrorAlert = async (
  title = "Error",
  text = "Ha ocurrido un error inesperado",
  confirmButtonText = "Entendido",
) => {
  return await Swal.fire({
    ...swalConfig,
    title,
    text,
    icon: "error",
    confirmButtonText,
    confirmButtonColor: "#dc2626",
  })
}

// Modal de carga
export const showLoadingAlert = (title = "Procesando...", text = "Por favor espere") => {
  Swal.fire({
    ...swalConfig,
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

// Cerrar modal de carga
export const closeLoadingAlert = () => {
  Swal.close()
}

// Modal de información
export const showInfoAlert = async (title: string, text: string, confirmButtonText = "Entendido") => {
  return await Swal.fire({
    ...swalConfig,
    title,
    text,
    icon: "info",
    confirmButtonText,
    confirmButtonColor: "#2563eb",
  })
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
