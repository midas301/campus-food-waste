USE campus_food;
-- Top providers by food distributed
SELECT u.name, SUM(d.quantity_distributed) AS total
FROM distribution d JOIN request r USING(request_id)
JOIN food_item f ON f.food_id = r.food_id JOIN users u ON u.user_id = f.provider_id
GROUP BY u.user_id ORDER BY total DESC;
-- Distributed per category
SELECT c.category_name, SUM(d.quantity_distributed) AS total
FROM distribution d JOIN request r USING(request_id)
JOIN food_item f ON f.food_id = r.food_id JOIN category c USING(category_id)
GROUP BY c.category_id;
-- Request fulfilment rate
SELECT ROUND(100 * SUM(status='Completed') / COUNT(*), 1) AS fulfilment_pct FROM request;