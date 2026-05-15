import { LoaderCircle } from "lucide-react";

export function Spinner() {
  return <LoaderCircle className="h-5 w-5 animate-spin text-brand-600" aria-label="Loading" />;
}
