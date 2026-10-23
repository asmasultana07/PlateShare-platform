const test = require('node:test');
const assert = require('node:assert/strict');
const { isSafeImageSource } = require('../utils/common');
const { validateFood } = require('../utils/validation');
const { buildUserFilter } = require('../controllers/adminController');

const categories = ['Produce'];
const validFood = {
  title: 'Fresh vegetables',
  category: 'Produce',
  description: 'A box of fresh vegetables for a nearby neighbour.',
  quantity: 4,
  location: 'Dhanmondi',
  pickupWindow: 'Today, 5–7 PM',
  image: 'https://example.com/food.jpg',
};

test('accepts a valid food listing and normalizes image fields', () => {
  const result = validateFood(validFood, categories);
  assert.equal(result.error, undefined);
  assert.deepEqual(result.food.images, ['https://example.com/food.jpg']);
});

test('rejects unsafe image sources and invalid categories', () => {
  assert.equal(isSafeImageSource('javascript:alert(1)'), false);
  const result = validateFood({ ...validFood, image: 'javascript:alert(1)' }, categories);
  assert.match(result.error, /valid image URLs/i);
  assert.match(validateFood({ ...validFood, category: 'Unknown' }, categories).error, /category/i);
});

test('rejects invalid quantities and oversized text', () => {
  assert.match(validateFood({ ...validFood, quantity: 0 }, categories).error, /servings/i);
  assert.match(validateFood({ ...validFood, title: 'x'.repeat(121) }, categories).error, /title/i);
});

test('builds a bounded escaped admin user search filter', () => {
  const filter = buildUserFilter('  alice+admin@example.com  ');
  assert.equal(filter.$or.length, 2);
  assert.equal(filter.$or[0].name.source, 'alice\\+admin@example\\.com');
  assert.equal(filter.$or[0].name.ignoreCase, true);
  assert.deepEqual(buildUserFilter(''), {});
  assert.equal(buildUserFilter('x'.repeat(150)).$or[0].name.source.length, 100);
});
