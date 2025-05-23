// Update the types.ts file to include Supply and BirthRecord types

export interface User {
  id: string
  username: string
  email: string
  role: string
}

export interface Bird {
  id: string
  birdId: string
  species: string
  age: number
  weight: number
  healthStatus: string
  location: string
  acquisitionDate: string
  notes: string
}

export interface Egg {
  id: string
  eggId: string
  layDate: string
  birdId: string
  weight: number
  quality: string
  notes: string
  status: string
}

export interface Tray {
  id: string
  trayId: string
  capacity: number
  currentCount: number
  location: string
  lastCollectionDate: string
  notes: string
}

export interface Supply {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  lastRestocked: string
  minimumLevel: number
}

export interface BirthRecord {
  id: string
  batchId: string
  date: string
  numberOfChicks: number
  motherHenId: string
  notes: string
  healthStatus: string
}
