import { parseAsString, parseAsInteger, parseAsArrayOf, createLoader, parseAsIndex } from 'nuqs/server'

// Define the search parameters we want to track
export const searchParamsCache = {

  sort: parseAsString.withDefault(''),
  size: parseAsArrayOf(parseAsString).withDefault([]),
  brand: parseAsArrayOf(parseAsString).withDefault([]),
  style: parseAsArrayOf(parseAsString).withDefault([]),
  maxPrice: parseAsInteger.withDefault(30000),
  minPrice: parseAsInteger.withDefault(0),

  // Pagination
  page: parseAsIndex.withDefault(0),
  limit: parseAsInteger.withDefault(20),
}

export const loadSearchParams = createLoader(searchParamsCache)
