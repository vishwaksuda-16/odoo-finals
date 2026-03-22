/** Mutually exclusive bucket per ECO for charts (avoids Draft + Rejected double-count). */
export function ecoPipelineBucket(eco) {
  if (eco.status === "Approved") return "Approved";
  if (eco.status === "Rejected") return "Rejected";
  if (eco.stage === "Approval") return "Approval";
  if (eco.stage === "New" || eco.stage === "In Progress") return "InProgress";
  if (eco.stage === "Done") return "Approved";
  if (eco.stage === "Draft") return "Draft";
  return "Draft";
}

export function countEcosByPipelineBucket(ecos) {
  const acc = { InProgress: 0, Approval: 0, Approved: 0, Draft: 0, Rejected: 0 };
  (ecos || []).forEach((e) => {
    const b = ecoPipelineBucket(e);
    if (b === "InProgress") acc.InProgress += 1;
    else if (b === "Approval") acc.Approval += 1;
    else if (b === "Approved") acc.Approved += 1;
    else if (b === "Rejected") acc.Rejected += 1;
    else acc.Draft += 1;
  });
  return acc;
}
