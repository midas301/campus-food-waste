USE campus_food;
DELIMITER //

CREATE PROCEDURE approve_request(IN p_id INT)
BEGIN
  DECLARE v_food INT DEFAULT NULL;
  DECLARE v_qty INT;
  DECLARE v_avail INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
  START TRANSACTION;
  SELECT food_id, requested_quantity INTO v_food, v_qty
    FROM request WHERE request_id = p_id AND status = 'Pending' FOR UPDATE;
  IF v_food IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Request is not pending';
  END IF;
  SELECT quantity INTO v_avail FROM food_item WHERE food_id = v_food FOR UPDATE;
  IF v_avail < v_qty THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Not enough quantity available';
  END IF;
  UPDATE food_item SET quantity = quantity - v_qty,
         status = IF(quantity = 0, 'Reserved', status)
   WHERE food_id = v_food;
  UPDATE request SET status = 'Approved' WHERE request_id = p_id;
  COMMIT;
END//

CREATE PROCEDURE distribute_request(IN p_id INT, IN p_collected VARCHAR(100))
BEGIN
  DECLARE v_food INT DEFAULT NULL;
  DECLARE v_qty INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
  START TRANSACTION;
  SELECT food_id, requested_quantity INTO v_food, v_qty
    FROM request WHERE request_id = p_id AND status = 'Approved' FOR UPDATE;
  IF v_food IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Request is not approved';
  END IF;
  INSERT INTO distribution (request_id, quantity_distributed, collected_by)
    VALUES (p_id, v_qty, p_collected);
  UPDATE request SET status = 'Completed' WHERE request_id = p_id;
  UPDATE food_item SET status = 'Distributed'
   WHERE food_id = v_food AND quantity = 0
     AND NOT EXISTS (SELECT 1 FROM request r
                     WHERE r.food_id = v_food AND r.status IN ('Pending','Approved'));
  COMMIT;
END//

DELIMITER ;