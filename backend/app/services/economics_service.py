from typing import Dict, Any, Optional

class FuelEconomicsService:
    """
    Financial and Lifecycle Intelligence Engine for Fuel Comparisons.
    Calculates cost-per-distance, break-even thresholds, annual savings, 
    and evidence-based lifecycle greenhouse gas emissions.
    """
    
    @staticmethod
    def calculate_comparison(
        e85_price_per_gal: float,
        gas_price_per_gal: float,
        baseline_e85_mpg: float,
        baseline_gas_mpg: float,
        annual_miles: float = 15000.0,
        trip_distance_miles: Optional[float] = None,
        custom_e85_mpg: Optional[float] = None,
        custom_gas_mpg: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Calculates complete financial comparison between E85 and Unleaded Gasoline.
        """
        e85_mpg = custom_e85_mpg if (custom_e85_mpg and custom_e85_mpg > 0) else baseline_e85_mpg
        gas_mpg = custom_gas_mpg if (custom_gas_mpg and custom_gas_mpg > 0) else baseline_gas_mpg
        
        # Guard against zero division
        e85_mpg = max(4.0, e85_mpg)
        gas_mpg = max(5.0, gas_mpg)
        
        # Price discount percentage (how much cheaper E85 is per gallon)
        price_discount_pct = round(((gas_price_per_gal - e85_price_per_gal) / gas_price_per_gal) * 100.0, 1)
        
        # Energy density penalty percentage (how much lower E85 MPG is compared to gas)
        energy_penalty_pct = round(((gas_mpg - e85_mpg) / gas_mpg) * 100.0, 1)
        
        # Break-even threshold: E85 must cost less than Gas_Price * (E85_MPG / Gas_MPG)
        mpg_ratio = e85_mpg / gas_mpg
        break_even_e85_price = round(gas_price_per_gal * mpg_ratio, 2)
        
        # Is E85 currently economical per mile?
        is_economical = e85_price_per_gal < break_even_e85_price
        
        # Cost per mile
        cost_per_mile_e85 = round(e85_price_per_gal / e85_mpg, 4)
        cost_per_mile_gas = round(gas_price_per_gal / gas_mpg, 4)
        
        # Cost per 100 miles
        cost_per_100_e85 = round(cost_per_mile_e85 * 100.0, 2)
        cost_per_100_gas = round(cost_per_mile_gas * 100.0, 2)
        
        # Annual expenditures
        annual_gallons_e85 = annual_miles / e85_mpg
        annual_gallons_gas = annual_miles / gas_mpg
        
        annual_cost_e85 = round(annual_gallons_e85 * e85_price_per_gal, 2)
        annual_cost_gas = round(annual_gallons_gas * gas_price_per_gal, 2)
        
        annual_savings = round(annual_cost_gas - annual_cost_e85, 2)
        annual_savings_pct = round(((annual_cost_gas - annual_cost_e85) / annual_cost_gas) * 100.0, 1) if annual_cost_gas > 0 else 0.0
        
        # Optional trip cost
        trip_cost_e85 = None
        trip_cost_gas = None
        if trip_distance_miles and trip_distance_miles > 0:
            trip_cost_e85 = round((trip_distance_miles / e85_mpg) * e85_price_per_gal, 2)
            trip_cost_gas = round((trip_distance_miles / gas_mpg) * gas_price_per_gal, 2)
            
        # Lifecycle GHG Emission Modeling
        # Based on Argonne National Laboratory GREET Model:
        # Standard gasoline: ~11.4 kg CO2e per gallon lifecycle.
        # Corn ethanol E85: ~6.5 kg CO2e per gallon lifecycle (approx. 43% net reduction across agriculture, refining, and combustion cycle).
        gas_lifecycle_co2_kg = annual_gallons_gas * 11.4
        e85_lifecycle_co2_kg = annual_gallons_e85 * 6.5
        co2_saving_kg = max(0.0, gas_lifecycle_co2_kg - e85_lifecycle_co2_kg)
        co2_saving_lbs = round(co2_saving_kg * 2.20462, 1)
        
        disclosure = (
            "Lifecycle emissions estimations utilize Argonne National Laboratory GREET (Greenhouse gases, "
            "Regulated Emissions, and Energy use in Technologies) parameters, accounting for agricultural inputs, "
            "biorefinery process energy, and biogenic carbon absorption. E85 lifecycle benefits vary by feedstock and regional grid."
        )
        
        return {
            "e85_price_per_gal": e85_price_per_gal,
            "gas_price_per_gal": gas_price_per_gal,
            "price_discount_pct": price_discount_pct,
            "e85_mpg": round(e85_mpg, 1),
            "gas_mpg": round(gas_mpg, 1),
            "energy_density_penalty_pct": energy_penalty_pct,
            "break_even_e85_price": break_even_e85_price,
            "is_e85_economical": is_economical,
            "cost_per_mile_e85": cost_per_mile_e85,
            "cost_per_mile_gas": cost_per_mile_gas,
            "cost_per_100_miles_e85": cost_per_100_e85,
            "cost_per_100_miles_gas": cost_per_100_gas,
            "annual_fuel_cost_e85": annual_cost_e85,
            "annual_fuel_cost_gas": annual_cost_gas,
            "annual_savings_amount": annual_savings,
            "annual_savings_pct": annual_savings_pct,
            "trip_cost_e85": trip_cost_e85,
            "trip_cost_gas": trip_cost_gas,
            "co2_lifecycle_saving_lbs": co2_saving_lbs,
            "co2_methodology_disclosure": disclosure
        }

economics_service = FuelEconomicsService()
