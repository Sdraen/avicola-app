export interface IdJaulaRule {
  required: true;
  type: "number";
  min: number;
  exists: "jaula";
}

export interface ColorAnilloRule {
  required: true;
  type: "string";
  minLength: number;
  maxLength: number;
  pattern: RegExp;
  unique: true;
}

export interface EdadRule {
  required: true;
  type: "string";
  pattern: RegExp;
  validate: "ageRange";
}

export interface EstadoPuestaRule {
  required: true;
  type: "string";
  enum: Array<"activa" | "inactiva" | "en_desarrollo" | "retirada">;
}

export interface RazaRule {
  required: true;
  type: "string";
  minLength: number;
  maxLength: number;
  enum: Array<
    | "leghorn white"
    | "leghorn brown"
  >;
}

export interface PesoRule {
  type: "number";
  min: number;
  max: number;
}

export interface AveValidationRules {
  id_jaula: IdJaulaRule;
  color_anillo: ColorAnilloRule;
  edad: EdadRule;
  estado_puesta: EstadoPuestaRule;
  raza: RazaRule;
  peso?: PesoRule;
}

export const aveValidationRules: AveValidationRules = {
  id_jaula: {
    required: true,
    type: "number",
    min: 1,
    exists: "jaula", // Verificar que la jaula existe
  },
  color_anillo: {
    required: true,
    type: "string",
    minLength: 2,
    maxLength: 20,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, // Solo letras y espacios
    unique: true, // Color único por jaula
  },
  edad: {
    required: true,
    type: "string",
    pattern: /^\d+\s+(días?|semanas?|meses?|años?)$/, // "6 meses", "2 años"
    validate: "ageRange", // Función personalizada
  },
  estado_puesta: {
    required: true,
    type: "string",
    enum: ["activa", "inactiva", "en_desarrollo", "retirada"],
  },
  raza: {
    required: true,
    type: "string",
    minLength: 3,
    maxLength: 50,
    enum: [
      "leghorn white",
      "leghorn brown",
    ],
  },
  peso: {
    type: "number",
    min: 0.5, // kg
    max: 5.0, // kg
  },
};

export const validateAveAge = (edad: string): boolean => {
  const agePattern = /^(\d+)\s+(días?|semanas?|meses?|años?)$/
  const match = edad.match(agePattern)

  if (!match) return false

  const [, number, unit] = match
  const num = Number.parseInt(number)

  switch (unit.toLowerCase()) {
    case "día":
    case "días":
      return num >= 1 && num <= 365
    case "semana":
    case "semanas":
      return num >= 1 && num <= 52
    case "mes":
    case "meses":
      return num >= 1 && num <= 60 // 5 años máximo
    case "año":
    case "años":
      return num >= 1 && num <= 5
    default:
      return false
  }
}
