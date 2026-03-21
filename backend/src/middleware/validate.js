const { z } = require('zod');

// Schema for creating a new product
const productSchema = z.object({
  sku: z.string().min(3, "SKU must be at least 3 characters").toUpperCase(),
  name: z.string().min(2, "Name is too short"),
  initialSalePrice: z.number().gt(0, "Price must be greater than 0"),
  initialCostPrice: z.number().gt(0, "Cost must be positive"),
});

// Schema for creating an ECO
const ecoSchema = z.object({
  title: z.string().min(5, "Title must be descriptive"),
  type: z.enum(["PRODUCT", "BOM"]),
  productId: z.string().uuid("Invalid Product ID format"),
  proposedChanges: z.object({
    salePrice: z.number().optional(),
    costPrice: z.number().optional(),
  }),
});

// Middleware function to run the validation
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body); // If this fails, it throws an error
    next();
  } catch (err) {
    return res.status(400).json({
      error: "Validation Error",
      details: err.errors.map(e => ({ field: e.path[0], message: e.message }))
    });
  }
};

module.exports = { validate, productSchema, ecoSchema };