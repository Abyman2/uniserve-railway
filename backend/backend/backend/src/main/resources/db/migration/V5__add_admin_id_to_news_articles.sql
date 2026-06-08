ALTER TABLE news_articles
ADD COLUMN admin_id TYPE uuid;
USING admin_id::uuid;

ALTER TABLE news_articles
ADD CONSTRAINT fk_news_admin
FOREIGN KEY (admin_id) REFERENCES admin(id);