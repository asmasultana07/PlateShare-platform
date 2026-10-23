const { cleanText, isSafeImageSource } = require('./common');

function validateFood(input, allowedCategories) {
  const suppliedImages = input.images === undefined ? [] : input.images;
  if (!Array.isArray(suppliedImages)) {
    return { error: 'Images must be provided as a list of URLs.' };
  }

  const images = [...new Set([cleanText(input.image), ...suppliedImages.map(cleanText)].filter(Boolean))];
  if (!images.length || images.length > 5 || images.some((image) => !isSafeImageSource(image))) {
    return { error: 'Add between one and five valid image URLs.' };
  }

  const food = {
    title: cleanText(input.title),
    category: cleanText(input.category),
    description: cleanText(input.description),
    quantity: Number(input.quantity),
    location: cleanText(input.location),
    pickupWindow: cleanText(input.pickupWindow),
    image: images[0],
    images,
  };

  if (food.title.length < 3 || food.title.length > 120 || food.description.length < 12 || food.description.length > 2_000) {
    return { error: 'Add a title and a description of at least 12 characters.' };
  }
  if (!allowedCategories.includes(food.category)) {
    return { error: 'Choose a valid food category.' };
  }
  if (!Number.isInteger(food.quantity) || food.quantity < 1) {
    return { error: 'Servings must be a positive whole number.' };
  }
  if (!food.location || food.location.length > 160 || !food.pickupWindow || food.pickupWindow.length > 160) {
    return { error: 'Location and pickup time are required.' };
  }
  return { food };
}

module.exports = { validateFood };
