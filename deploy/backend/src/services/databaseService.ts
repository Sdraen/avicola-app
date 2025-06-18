import { supabase } from "../config/supabase"

export class DatabaseService {
  // Generic CRUD operations
  static async findAll(table: string, select = "*", orderBy?: { column: string; ascending?: boolean }) {
    let query = supabase.from(table).select(select)

    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  static async findById(table: string, id: string | number, idColumn = "id", select = "*") {
    const { data, error } = await supabase.from(table).select(select).eq(idColumn, id).single()

    if (error) throw error
    return data
  }

  static async create(table: string, data: any) {
    const { data: result, error } = await supabase.from(table).insert([data]).select().single()

    if (error) throw error
    return result
  }

  static async update(table: string, id: string | number, updates: any, idColumn = "id") {
    const { data, error } = await supabase.from(table).update(updates).eq(idColumn, id).select().single()

    if (error) throw error
    return data
  }

  static async delete(table: string, id: string | number, idColumn = "id") {
    const { error } = await supabase.from(table).delete().eq(idColumn, id)

    if (error) throw error
    return true
  }

  static async count(table: string, filters?: any) {
    let query = supabase.from(table).select("*", { count: "exact", head: true })

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { count, error } = await query

    if (error) throw error
    return count || 0
  }

  // Relationship queries
  static async findWithRelations(table: string, relations: string, filters?: any) {
    let query = supabase.from(table).select(relations)

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  // Date range queries
  static async findByDateRange(table: string, dateColumn: string, startDate: string, endDate: string, select = "*") {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .gte(dateColumn, startDate)
      .lte(dateColumn, endDate)
      .order(dateColumn, { ascending: false })

    if (error) throw error
    return data
  }

  // Search functionality
  static async search(table: string, searchColumns: string[], query: string, select = "*") {
    const searchConditions = searchColumns.map((column) => `${column}.ilike.%${query}%`).join(", ")

    const { data, error } = await supabase.from(table).select(select).or(searchConditions)

    if (error) throw error
    return data
  }
}
