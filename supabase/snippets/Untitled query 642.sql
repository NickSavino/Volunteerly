SELECT column_name, data_type, ordinal_position
FROM information_schema.columns
WHERE table_name = 'RegisteredCharity'
ORDER BY ordinal_position;