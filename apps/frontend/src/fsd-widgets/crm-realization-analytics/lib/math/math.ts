export const getPercent = (realization: number, plan: number) => Math.round((realization / plan) * 100);

export const getDepthOfSales = (shipmentCount: number, customerShipment: number) =>
	Math.round((shipmentCount / customerShipment) * 10) / 10;

export const getAverageOrderValue = (realization: number, shipmentCount: number) =>
	Math.round(realization / shipmentCount);
