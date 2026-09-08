-- Merchant edits are bounded, but cancellation must be able to restore stock
-- even if an operator replenished inventory up to that input bound first.
CREATE TABLE variants_next (workspace TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, id TEXT NOT NULL, product_id TEXT NOT NULL, sku TEXT NOT NULL, name TEXT NOT NULL, finish TEXT NOT NULL, color TEXT NOT NULL, price INTEGER NOT NULL CHECK(price >= 0 AND price <= 100000000), stock INTEGER NOT NULL CHECK(stock >= 0), image TEXT NOT NULL, PRIMARY KEY(workspace,id), UNIQUE(workspace,sku), FOREIGN KEY(workspace,product_id) REFERENCES products(workspace,id) ON DELETE CASCADE);
INSERT INTO variants_next SELECT * FROM variants;
DROP TABLE variants;
ALTER TABLE variants_next RENAME TO variants;
INSERT INTO migrations(version,applied_at) VALUES(2,datetime('now'));
