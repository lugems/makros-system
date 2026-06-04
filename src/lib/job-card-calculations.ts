export function calculateJobCardTotals(input: {
  serviceAmount: number;
  additionalLaborCost: number;
  partsTotal: number;
}) {
  const serviceAmount = Math.max(0, input.serviceAmount || 0);
  const additionalLaborCost = Math.max(0, input.additionalLaborCost || 0);
  const partsTotal = Math.max(0, input.partsTotal || 0);

  const laborCost = serviceAmount + additionalLaborCost;
  const jobTotal = laborCost + partsTotal;

  return {
    serviceAmount,
    additionalLaborCost,
    laborCost,
    partsTotal,
    jobTotal,
  };
}