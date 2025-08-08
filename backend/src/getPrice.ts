import axios from 'axios';
import type { VastOffer, VastSearchResponse } from './types/vast';
import type { AkashGpuPrices, AkashModel } from './types/akash';

const isVastH100SXMName = (name: string | undefined): boolean => {
	if (!name) return false;
	return name.trim().toLowerCase() === 'h100 sxm';
};

const computeVastPricePerFullGpuHour = (offer: VastOffer): number | null => {
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

	const h100SXMOffers = offers.filter((o) => isVastH100SXMName(o.gpu_name));
	if (h100SXMOffers.length === 0) return null;

	let bestPrice: number | null = null;
	let bestOfferId: number | null = null;
	for (const offer of h100SXMOffers) {
		const price = computeVastPricePerFullGpuHour(offer);
		if (price == null) continue;
		if (bestPrice == null || price < bestPrice) {
			bestPrice = price;
			bestOfferId = offer.id;
		}
	}

	return bestPrice;
};

// Akash helpers and fetcher
const isAkashH100SXMModel = (model: AkashModel): boolean => {
  const vendor = model.vendor?.trim().toLowerCase();
  const name = model.model?.trim().toLowerCase();
  const iface = model.interface?.trim().toUpperCase();
  return vendor === 'nvidia' && name === 'h100' && iface === 'SXM5';
};

export const getAkashH100SXMPrice = async (): Promise<number | null> => {
  const url = 'https://console-api.akash.network/v1/gpu-prices';
  const { data } = await axios.get<AkashGpuPrices>(url, {
    headers: { Accept: 'application/json' },
    timeout: 15000,
  });

  const models = data?.models ?? [];
  const h100 = models.find(isAkashH100SXMModel);
  if (!h100) return null;
  return h100.price?.min ?? null;
};
