// Flip to false to hide the map picker. The location page then lets people continue without a pin.
export const MAPS_ENABLED = true;

// Turn this ON only after you have loaded places into Supabase (see the GeoNames guide).
//   ON : the "Area" field searches your places table; hosts pick a place or add a new one.
//   OFF: hosts type the area by hand (tap-to-fill suggestions for Kenya).
export const GAZETTEER_ENABLED = true;