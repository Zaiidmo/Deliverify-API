const { validateRestaurant } = require('../../validations/restaurantValidation');

describe('validateRestaurant', () => {
  test('devrait renvoyer isValid: true si toutes les données sont correctes', () => {
    const validData = {
      name: 'Test Restaurant',
      address: '123 Test St',
      phoneNumber: '0123456789',
      logo: 'logo.jpg',
      images: ['img1.jpg', 'img2.jpg'],
      location: { type: 'Point', coordinates: [40, -73] },
      openAt: '10:00',
      closeAt: '22:00',
      category: { name: 'Fast Food', description: 'Fast food' },
    };

    const result = validateRestaurant(validData);
    expect(result.isValid).toBe(true);
    expect(result.message).toBeNull();
  });

  test('devrait renvoyer une erreur si le nom du restaurant est manquant', () => {
    const invalidData = {
      address: '123 Test St',
      phoneNumber: '0123456789',
    };

    const result = validateRestaurant(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Name is required');
  });

  test('devrait renvoyer une erreur si le numéro de téléphone est invalide', () => {
    const invalidData = {
      name: 'Test Restaurant',
      address: '123 Test St',
      phoneNumber: '123',
    };

    const result = validateRestaurant(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Phone number must be between 10 and 14 digits');
  });

  test('devrait renvoyer une erreur si plus de 5 images sont fournies', () => {
    const invalidData = {
      name: 'Test Restaurant',
      address: '123 Test St',
      phoneNumber: '0123456789',
      images: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg', 'img6.jpg'],
    };

    const result = validateRestaurant(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('You can upload a maximum of 5 images');
  });
});