import { Terminal } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AlertView() {
  return (
    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertTitle>Warning!!</AlertTitle>
      <AlertDescription>
        Search failed: Unable to find the searched content
      </AlertDescription>
    </Alert>
  );
}
