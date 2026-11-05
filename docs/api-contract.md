# API contract

Base URL: `/api` · Auth header: `Authorization: Bearer <token>` (token comes from login)

| Method | Path | Role | Body / Query | Response |
|---|---|---|---|---|
| POST | /auth/register | public | name, email, phone, password, role (Provider or Recipient) | {user_id} |
| POST | /auth/login | public | email, password | {token, user} |
| GET | /food | any logged in | ?category_id &location_id | [food] |
| GET | /food/meta | any logged in | | {categories, locations} |
| POST | /food | Provider | food_name, quantity, unit, prepared_time, expiry_time, category_id, location_id | {food_id} |
| GET | /food/mine | Provider | | [food] |
| DELETE | /food/:id | Provider | | {deleted} |
| POST | /requests | Recipient | food_id, requested_quantity | {request_id} |
| GET | /requests/mine | Recipient | | [request] |
| GET | /requests/incoming | Provider | | [request] |
| PATCH | /requests/:id/approve | Provider | | {ok} |
| PATCH | /requests/:id/reject | Provider | | {ok} |
| POST | /requests/:id/distribute | Provider | collected_by | {ok} |
| POST | /waste | Provider, Admin | food_id, wasted_quantity, reason | {ok} |
| GET | /waste | Provider, Admin | ?reason | [waste_log] |
| GET | /analytics/:metric | Admin | summary, by-reason, by-category, by-location, weekly | aggregated data |
| GET | /notifications | any logged in | | [notification] |
| PATCH | /notifications/read | any logged in | | {ok} |

Errors return `{ "error": "message" }` with status 400, 401 (not logged in), 403 (wrong role) or 404.