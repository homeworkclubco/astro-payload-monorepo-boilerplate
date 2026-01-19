/**
 * Props for BaseLayout - the HTML shell
 */
export interface BaseLayoutProps {
  /** Page title */
  title?: string;
  /** Meta description */
  description?: string;
  /** Language attribute for <html> element */
  lang?: string;
  /** Whether to add noindex meta tag */
  noIndex?: boolean;
}

/**
 * Props for PreviewLayout - SSR preview pages
 */
export interface PreviewLayoutProps extends BaseLayoutProps {
  /** Payload CMS URL for live preview connection */
  payloadUrl: string;
  /** Optional error message to display */
  error?: string | null;
}
