const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// GET all products
router.get('/', async (req, res) => {
  try {
  // find all products
    const productData = await Product.findAll({
  // be sure to include its associated Category and Tag data
     include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  try {
    const productData = await Product.findByPk(req.params.id, {
  // be sure to include its associated Category and Tag data
    include: [{ model: Category }, { model: Tag }],
  });
  
  if (!productData) {
    res.status(404).json({ message: 'No product found with that id!' });
    return;
  }
  res.status(200).json(productData);
} catch (err) {
  res.status(500).json(err);
}
});

// create new product
router.post('/', async (req, res) => {
  try {
    // Create the product
    const product = await Product.create(req.body);

    // Check if there are product tags
    if (req.body.tagIds && req.body.tagIds.length) {
      // Create product tags and pairings in the ProductTag model
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });

      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});


// update product
router.put('/:id', async (req, res) => {
  try {
    // update product data
    await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    // Find all associated tags from ProductTag
    const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });

    // Remove existing product tags
    await ProductTag.destroy({ where: { product_id: req.params.id } });

    // Create new product tags
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });

      await ProductTag.bulkCreate(productTagIdArr);
    }

    // Find the updated product with associated Category and Tag data
    const updatedProduct = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });

    res.json({ product: updatedProduct, updatedTags: productTags });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});


router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const product = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!product) {
      res.status(404).json({ message: 'No product found with that id!' });
      return;
    }

    res.status(200).json({ message: 'Product removed!' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
