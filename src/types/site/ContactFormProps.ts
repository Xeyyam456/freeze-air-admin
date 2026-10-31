import type { ContactName } from "./ContactName";
import type { ContactValues } from "./ContactValues";
import type { SiteSettings } from "./SiteSettings";

export type ContactFormProps = { settings: SiteSettings; values: ContactValues; onChange: (name: ContactName, value: string) => void };
