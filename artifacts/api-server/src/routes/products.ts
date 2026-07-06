import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const productsRouter = Router();

// Map DB row → frontend Product shape
function toProduct(row: typeof productsTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    description: row.description,
    category: row.category,
    badge: row.badge ?? null,
    affiliateLink: row.affiliateLink,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : String(row.createdAt),
  };
}

// GET /api/products
productsRouter.get("/products", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(productsTable)
      .orderBy(productsTable.createdAt);
    res.json(rows.map(toProduct).reverse());
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST /api/products
productsRouter.post("/products", async (req, res) => {
  try {
    const { name, price, description, category, badge, affiliateLink, imageUrl } = req.body;

    if (!name || price == null || !description || !category || !affiliateLink || !imageUrl) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      res.status(400).json({ error: "Price must be a positive number" });
      return;
    }

    const [row] = await db
      .insert(productsTable)
      .values({
        name: String(name),
        price: String(parsedPrice),
        description: String(description),
        category: String(category),
        badge: badge ? String(badge) : null,
        affiliateLink: String(affiliateLink),
        imageUrl: String(imageUrl),
      })
      .returning();

    res.status(201).json(toProduct(row));
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id
productsRouter.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, badge, affiliateLink, imageUrl } = req.body;

    const updates: Partial<typeof productsTable.$inferInsert> = {};
    if (name !== undefined) updates.name = String(name);
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        res.status(400).json({ error: "Price must be a positive number" });
        return;
      }
      updates.price = String(parsedPrice);
    }
    if (description !== undefined) updates.description = String(description);
    if (category !== undefined) updates.category = String(category);
    if (badge !== undefined) updates.badge = badge ? String(badge) : null;
    if (affiliateLink !== undefined) updates.affiliateLink = String(affiliateLink);
    if (imageUrl !== undefined) updates.imageUrl = String(imageUrl);

    const [row] = await db
      .update(productsTable)
      .set(updates)
      .where(eq(productsTable.id, id))
      .returning();

    if (!row) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(toProduct(row));
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id
productsRouter.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default productsRouter;
