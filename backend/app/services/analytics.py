from typing import Dict, List


def compute_powder_factor(rock_density_t_m3: float, explosive_density_kg_m3: float, explosive_column_m: float, hole_diameter_mm: float, burden_m: float, spacing_m: float, bench_height_m: float) -> float:
	# Convert hole diameter to meters and compute explosive column volume
	hole_radius_m = (hole_diameter_mm / 1000.0) / 2.0
	column_volume_m3 = 3.1415926535 * (hole_radius_m ** 2) * explosive_column_m
	explosive_mass_kg = explosive_density_kg_m3 * column_volume_m3
	# Rock volume per hole = burden * spacing * bench height
	rock_volume_m3 = burden_m * spacing_m * bench_height_m
	if rock_volume_m3 <= 0:
		return 0.0
	# Powder factor kg per cubic meter
	return explosive_mass_kg / rock_volume_m3


def summarize_burden_spacing(values: List[float]) -> Dict[str, float]:
	filtered = [v for v in values if v is not None]
	if not filtered:
		return {"min": 0.0, "max": 0.0, "avg": 0.0}
	return {
		"min": min(filtered),
		"max": max(filtered),
		"avg": sum(filtered) / len(filtered),
	}
