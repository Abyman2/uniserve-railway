DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'news_articles' AND column_name = 'author_id'
    ) THEN
        UPDATE news_articles
        SET admin_id = author_id
        WHERE admin_id IS NULL AND author_id IS NOT NULL;

        ALTER TABLE news_articles DROP COLUMN author_id;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'news_articles' AND column_name = 'admin_id'
    ) THEN
        ALTER TABLE news_articles ALTER COLUMN admin_id SET NOT NULL;
    END IF;
END $$;
