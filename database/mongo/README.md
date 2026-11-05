# MongoDB collections (database: campus_food_logs)

## waste_logs
{ waste_id (UUID, partial key), food_id (identifying owner, from MySQL),
  wasted_quantity, reason, recorded_time,
  food_snapshot: { food_name, category_name, location_name, building, provider_id } }
Unique index: { food_id, waste_id }

## notifications
{ user_id, message, read, created_at }