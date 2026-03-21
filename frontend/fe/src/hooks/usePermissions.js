import { useAuth } from "../context/AuthContext";

export function usePermissions() {
  const {
    user,
    isAdmin,
    canApprove,
    canStart,
    canViewStagesSettings,
    canViewApprovalsSettings,
    canViewAuditLogs,
  } = useAuth();

  const role = user?.role?.toUpperCase();

  return {
    role,
    isAdmin,
    canApprove,
    canStart,
    canEditStagesSettings: canViewStagesSettings,
    canEditApprovalsSettings: canViewApprovalsSettings,
    canManageUsers: isAdmin,
    canSeeProducts: !!role,
    canSeeBom: !!role,
    canSeeReporting: canViewAuditLogs,
  };
}
