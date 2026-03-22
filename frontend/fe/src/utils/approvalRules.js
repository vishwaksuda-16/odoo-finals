/** Rules at the approval (PENDING) stage that apply to this ECO's product. */
export function getRulesForEcoProduct(eco, approvals, stages) {
  if (!eco || !Array.isArray(approvals) || !Array.isArray(stages)) return [];
  const pendingStageId = stages.find((s) => s.pipelineKind === "PENDING")?.id;
  if (!pendingStageId) return [];
  return approvals.filter((r) => {
    if (r.stageId !== pendingStageId) return false;
    const allProducts = !r.productId;
    return allProducts || r.productId === eco.productId;
  });
}

export function hasRequiredApprovalConfigured(eco, approvals, stages) {
  return getRulesForEcoProduct(eco, approvals, stages).some((r) => r.approvalType === "Required");
}

export function getMyApproverDutyForEco(eco, userId, approvals, stages) {
  if (!userId) return [];
  return getRulesForEcoProduct(eco, approvals, stages).filter((r) => r.userId === userId);
}
