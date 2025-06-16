import { supabase } from "./supabase"
import logger from "../utils/logger"

export const executeQuery = async (operation: string, table: string, query: any) => {
  const start = Date.now()
  try {
    const result = await query
    const duration = Date.now() - start

    logger.logDbOperation(operation, table, duration, !result.error)

    if (result.error) {
      throw result.error
    }

    return result
  } catch (error) {
    const duration = Date.now() - start
    logger.logDbOperation(operation, table, duration, false)
    logger.error(`Database error in ${operation} on ${table}`, { error })
    throw error
  }
}

export const findAll = async (table: string, select = "*") => {
  return executeQuery("SELECT", table, supabase.from(table).select(select))
}

export const findById = async (table: string, id: string | number, idColumn = "id", select = "*") => {
  return executeQuery("SELECT_BY_ID", table, supabase.from(table).select(select).eq(idColumn, id).single())
}

export const create = async (table: string, data: any) => {
  return executeQuery("INSERT", table, supabase.from(table).insert([data]).select().single())
}

export const update = async (table: string, id: string | number, updates: any, idColumn = "id") => {
  return executeQuery("UPDATE", table, supabase.from(table).update(updates).eq(idColumn, id).select().single())
}

export const remove = async (table: string, id: string | number, idColumn = "id") => {
  return executeQuery("DELETE", table, supabase.from(table).delete().eq(idColumn, id))
}
