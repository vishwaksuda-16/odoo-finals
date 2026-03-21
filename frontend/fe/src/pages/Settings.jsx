import { Navigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";

export default function Settings() {
  const { canEditStagesSettings, canEditApprovalsSettings } = usePermissions();
  if (canEditStagesSettings) return <Navigate to="/settings/stages" replace />;
  if (canEditApprovalsSettings) return <Navigate to="/settings/approvals" replace />;
  return <Navigate to="/" replace />;
}