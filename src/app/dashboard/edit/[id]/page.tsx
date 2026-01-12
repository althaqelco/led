import EditPropertyClient from "./EditPropertyClient";

// For static export - generate placeholder path
// In production static export, Firebase rewrites handle routing to index.html
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

// Allow dynamic params in dev, but static export will only pre-render placeholder
export const dynamicParams = true;

export default function EditPropertyPage() {
  return <EditPropertyClient />;
}
