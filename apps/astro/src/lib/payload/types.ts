// Standard Payload CMS Paginated Response
export interface PayloadPaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

// Error Interface
export interface PayloadError {
  message: string;
  status?: number;
  code?: string;
  endpoint?: string;
  details?: unknown;
}

// Result Pattern: Success
export interface PayloadSuccess<T> {
  success: true;
  data: T;
}

// Result Pattern: Failure
export interface PayloadFailure {
  success: false;
  error: PayloadError;
}

// Union Type for Return Values
export type PayloadResult<T> = PayloadSuccess<T> | PayloadFailure;

// Configuration for the Base Client
export interface FetchOptions {
  endpoint: string; // e.g., '/api/pages'
  headers?: Record<string, string>;
  cache?: RequestCache; // 'force-cache', 'no-store', etc.
  //   next?: NextFetchRequestConfig; // For Next.js/ISR support if needed later
}
