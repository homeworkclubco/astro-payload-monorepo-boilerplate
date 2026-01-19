// Re-export all Payload types from the CMS app
import type { Page } from "../../../cms/src/payload-types";
export * from "../../../cms/src/payload-types";

// Export commonly used type combinations
export type PageData = Page & {
  // Add any computed fields here
};

export type APIResponse<T = any> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
