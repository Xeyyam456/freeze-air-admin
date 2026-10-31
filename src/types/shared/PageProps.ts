export type PageProps = {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
  children: React.ReactNode;
};
