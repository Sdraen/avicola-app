// Central export file for all validation schemas
export * from "./baseValidation"
export * from "./constants"

// Entity validations
export * from "./aveSchema"
export * from "./huevoSchema"
export * from "./clienteSchema"
export * from "./ventaSchema"
export * from "./jaulaSchema"
export * from "./compraSchema"
export * from "./medicamentoSchema"
export * from "./vacunaSchema"
export * from "./incubacionSchema"
export * from "./razaSchema"
export * from "./registroHuevoSchema"
export * from "./authSchema"

// Validation function mapper
export const getValidator = (entity: string) => {
  const validators: Record<string, Function> = {
    ave: require("./aveSchema").validateAve,
    huevo: require("./huevoSchema").validateHuevo,
    cliente: require("./clienteSchema").validateCliente,
    venta: require("./ventaSchema").validateVenta,
    jaula: require("./jaulaSchema").validateJaula,
    compra: require("./compraSchema").validateCompra,
    medicamento: require("./medicamentoSchema").validateMedicamento,
    vacuna: require("./vacunaSchema").validateVacuna,
    incubacion: require("./incubacionSchema").validateIncubacion,
    raza: require("./razaSchema").validateRaza,
    registro_huevo: require("./registroHuevoSchema").validateRegistroHuevo,
    usuario: require("./authSchema").validateUsuario,
    login: require("./authSchema").validateLogin,

    // Update validators
    ave_update: require("./aveSchema").validateAveUpdate,
    huevo_update: require("./huevoSchema").validateHuevoUpdate,
    cliente_update: require("./clienteSchema").validateClienteUpdate,
    venta_update: require("./ventaSchema").validateVentaUpdate,
    jaula_update: require("./jaulaSchema").validateJaulaUpdate,
    compra_update: require("./compraSchema").validateCompraUpdate,
    medicamento_update: require("./medicamentoSchema").validateMedicamentoUpdate,
    vacuna_update: require("./vacunaSchema").validateVacunaUpdate,
    incubacion_update: require("./incubacionSchema").validateIncubacionUpdate,
    raza_update: require("./razaSchema").validateRazaUpdate,
    usuario_update: require("./authSchema").validateUsuarioUpdate,

    // Special validators
    implemento: require("./compraSchema").validateImplemento,
    servicio_higiene: require("./jaulaSchema").validateServicioHigiene,
    aplicacion_medicamento: require("./medicamentoSchema").validateAplicacionMedicamento,
    aplicacion_vacuna: require("./vacunaSchema").validateAplicacionVacuna,
  }

  return validators[entity] || null
}
