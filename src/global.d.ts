declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
  const src: string;
  export default src;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.png' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_API_KEY?: string;
  readonly VITE_AUTH_DOMAIN?: string;
  readonly VITE_DATABASE_URL?: string;
  readonly VITE_PROJECT_ID?: string;
  readonly VITE_STORAGE_BUCKET?: string;
  readonly VITE_MESSAGING_SENDER_ID?: string;
  readonly VITE_APP_ID?: string;
  readonly VITE_MEASUREMENT_ID?: string;
  readonly VITE_E2E?: string;
  readonly VITE_APP_CHECK_SITE_KEY?: string;
  readonly REACT_APP_API_KEY?: string;
  readonly REACT_APP_AUTH_DOMAIN?: string;
  readonly REACT_APP_DATABASE_URL?: string;
  readonly REACT_APP_PROJECT_ID?: string;
  readonly REACT_APP_STORAGE_BUCKET?: string;
  readonly REACT_APP_MESSAGING_SENDER_ID?: string;
  readonly REACT_APP_APP_ID?: string;
  readonly REACT_APP_MEASUREMENT_ID?: string;
  readonly REACT_APP_APP_CHECK_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
