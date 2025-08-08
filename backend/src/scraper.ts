import axios from 'axios';

export interface VastOffer {
	id: number;
	ask_contract_id?: number;
	bundle_id?: number;
	bundled_results?: unknown | null;
	bw_nvlink?: number;
	compute_cap?: number;
	cpu_arch?: string;
	cpu_cores?: number;
	cpu_cores_effective?: number;
	cpu_ghz?: number;
	cpu_name?: string;
	cpu_ram?: number;
	credit_discount_max?: number;
	cuda_max_good?: number;
	direct_port_count?: number;
	disk_bw?: number;
	disk_name?: string;
	disk_space?: number;
	dlperf?: number;
	dlperf_per_dphtotal?: number;
	dph_base?: number;
	dph_total?: number;
	driver_version?: string;
	driver_vers?: number;
	duration?: number;
	end_date?: number;
	external?: unknown | null;
	flops_per_dphtotal?: number;
	geolocation?: string;
	geolocode?: number;
	gpu_arch?: string;
	gpu_display_active?: boolean;
	gpu_frac?: number;
	gpu_ids?: number[];
	gpu_lanes?: number;
	gpu_mem_bw?: number;
	gpu_name?: string;
	gpu_ram?: number;
	gpu_total_ram?: number;
	gpu_max_power?: number;
	gpu_max_temp?: number;
	has_avx?: number;
	host_id?: number;
	hosting_type?: number;
	hostname?: string | null;
	inet_down?: number;
	inet_down_cost?: number;
	inet_up?: number;
	inet_up_cost?: number;
	is_bid?: boolean;
	logo?: string;
	machine_id?: number;
	min_bid?: number;
	mobo_name?: string;
	num_gpus?: number;
	os_version?: string;
	pci_gen?: number;
	pcie_bw?: number;
	public_ipaddr?: string;
	reliability?: number;
	reliability_mult?: number;
	rentable?: boolean;
	rented?: boolean;
	score?: number;
	start_date?: number | null;
	static_ip?: boolean;
	storage_cost?: number;
	storage_total_cost?: number;
	total_flops?: number;
	verification?: string;
	vericode?: number;
	vram_costperhour?: number;
	webpage?: string | null;
	vms_enabled?: boolean;
	expected_reliability?: number;
	is_vm_deverified?: boolean;
	resource_type?: string;
	cluster_id?: number | null;
	avail_vol_ask_id?: number;
	avail_vol_dph?: number;
	avail_vol_size?: number;
	rn?: number;
	dph_total_adj?: number;
	reliability2?: number;
	discount_rate?: number;
	discounted_hourly?: number;
	discounted_dph_total?: number;
	search?: {
		gpuCostPerHour?: number;
		diskHour?: number;
		totalHour?: number;
		discountTotalHour?: number;
		discountedTotalPerHour?: number;
	};
	instance?: {
		gpuCostPerHour?: number;
		diskHour?: number;
		totalHour?: number;
		discountTotalHour?: number;
		discountedTotalPerHour?: number;
	};
	time_remaining?: string;
	time_remaining_isbid?: string;
	internet_up_cost_per_tb?: number;
	internet_down_cost_per_tb?: number;
	// Allow unexpected fields without type errors
	[key: string]: unknown;
}

interface VastSearchResponse {
	success?: boolean;
	offers?: VastOffer[];
}

const isH100SXMName = (name: string | undefined): boolean => {
	if (!name) return false;
	return name.trim().toLowerCase() === 'h100 sxm';
};

const computePricePerFullGpuHour = (offer: VastOffer): number | null => {
	const totalPerHour = offer.dph_total;
	const numGpus = offer.num_gpus ?? 1;
	const frac = offer.gpu_frac ?? 1;
	if (totalPerHour == null || numGpus <= 0 || frac <= 0) return null;
	return totalPerHour / (numGpus * frac);
};

/**
 * Fetches Vast.ai asks and returns the lowest normalized price per full H100 SXM GPU hour.
 * Normalization divides total hourly price by (num_gpus * gpu_frac).
 * No authentication is used per Vast.ai search docs.
 * @returns The normalized price per full H100 SXM GPU hour, or null if no offers are found.
 */
export const getH100SXMPrice = async (): Promise<number | null> => {
	const url = 'https://console.vast.ai/api/v0/search/asks/';

	// Try a slightly filtered search first; if API ignores fields, we still filter client-side
	const requestBody = {
		rentable: true,
	} as Record<string, unknown>;

	const { data } = await axios.put<VastSearchResponse>(url, requestBody, {
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		timeout: 15000,
	});

	const offers = ((data as VastSearchResponse).offers ?? []) as VastOffer[];

	const h100SXMOffers = offers.filter((o) => isH100SXMName(o.gpu_name));
	if (h100SXMOffers.length === 0) return null;

	let bestPrice: number | null = null;
	let bestOfferId: number | null = null;
	for (const offer of h100SXMOffers) {
		const price = computePricePerFullGpuHour(offer);
		if (price == null) continue;
		if (bestPrice == null || price < bestPrice) {
			bestPrice = price;
			bestOfferId = offer.id;
		}
	}

	return bestPrice;
};
