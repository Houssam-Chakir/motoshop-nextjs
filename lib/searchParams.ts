import { parseAsString, parseAsInteger, parseAsArrayOf, createLoader } from 'nuqs/server'

// Define the search parameters we want to track
export const searchParamsCache = {

  sort: parseAsString.withDefault(''),
  size: parseAsArrayOf(parseAsString).withDefault([]),
  type: parseAsArrayOf(parseAsString).withDefault([]),
  brand: parseAsArrayOf(parseAsString).withDefault([]),
  style: parseAsArrayOf(parseAsString).withDefault([]),
  maxPrice: parseAsInteger.withDefault(30000),
  minPrice: parseAsInteger.withDefault(0),

  // Pagination
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(2),
}

export const loadSearchParams = createLoader(searchParamsCache)
