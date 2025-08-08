export interface AkashAvailability {
	total: number;
	available: number;
}

export interface AkashProviderAvailability {
	total: number;
	available: number;
}

export interface AkashModelPrice {
	currency: string; // e.g., "USD"
	min: number;
	max: number;
	avg: number;
	weightedAverage: number;
	med: number;
}

export interface AkashModel {
	vendor: string; // e.g., "nvidia"
	model: string; // e.g., "h100"
	ram: string; // e.g., "80Gi"
	interface: string; // e.g., "SXM5" or "PCIe"
	availability: AkashAvailability;
	providerAvailability: AkashProviderAvailability;
	price: AkashModelPrice | null;
}

export interface AkashGpuPrices {
	availability: AkashAvailability;
	models: AkashModel[];
}
