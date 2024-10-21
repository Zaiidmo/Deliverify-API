const { createRestaurant } = require('../../services/restaurantService');
const User = require('../../models/User');
const Restaurant = require('../../models/Restaurant');

jest.mock('../../models/Restaurant');
jest.mock('../../models/User');

describe('createRestaurant', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('devrait créer un restaurant avec les valeurs par défaut si les champs logo, cover et images sont absents', async () => {
    const mockOwner = { _id: 'ownerId', name: 'Test Owner' };
    const restaurantData = {
      name: 'Restaurant Test',
      address: '123 Street',
      phoneNumber: '0123456789',
      location: { type: 'Point', coordinates: [10, 20] },
      openAt: '10:00',
      closeAt: '22:00',
      category: { name: 'Italian', description: 'Italian Food' },
      owner: mockOwner._id,
    };

    User.findById.mockResolvedValue(mockOwner); // Simule un propriétaire existant

    // Simule le constructeur Restaurant
    Restaurant.mockImplementation(function () {
      this.name = restaurantData.name;
      this.address = restaurantData.address;
      this.phoneNumber = restaurantData.phoneNumber;
      this.location = restaurantData.location;
      this.openAt = restaurantData.openAt;
      this.closeAt = restaurantData.closeAt;
      this.category = restaurantData.category;
      this.owner = restaurantData.owner;
      this.logo = this.logo || 'default-restaurant.jpg';
      this.cover = this.cover || 'default-cover.jpg';
      this.images = this.images || [];
      this.save = jest.fn().mockResolvedValue(this); // Renvoie l'instance pour la sauvegarde
    });

    const restaurant = await createRestaurant(restaurantData);

    expect(restaurant.logo).toBe('default-restaurant.jpg');
    expect(restaurant.cover).toBe('default-cover.jpg');
    expect(restaurant.images).toEqual([]);
    expect(restaurant.save).toHaveBeenCalled();
  });

  test('devrait lever une erreur si le propriétaire n\'existe pas', async () => {
    User.findById.mockResolvedValue(null); // Simule un propriétaire inexistant

    const restaurantData = {
      owner: 'nonexistentOwner',
      name: 'Test Restaurant',
    };

    await expect(createRestaurant(restaurantData)).rejects.toThrow('Propriétaire non trouvé');
  });

  test('devrait créer un restaurant avec les données fournies', async () => {
    const mockOwner = { _id: 'ownerId', name: 'Test Owner' };
    const restaurantData = {
      name: 'Test Restaurant',
      address: '123 Test St',
      phoneNumber: '0123456789',
      logo: 'custom-logo.jpg',
      cover: 'custom-cover.jpg',
      images: ['img1.jpg', 'img2.jpg'],
      location: { type: 'Point', coordinates: [40, -73] },
      openAt: '10:00',
      closeAt: '22:00',
      category: { name: 'Fast Food', description: 'Fast food category' },
      owner: mockOwner._id,
    };

    User.findById.mockResolvedValue(mockOwner);

    // Simule le constructeur Restaurant
    Restaurant.mockImplementation(function () {
      this.name = restaurantData.name;
      this.address = restaurantData.address;
      this.phoneNumber = restaurantData.phoneNumber;
      this.location = restaurantData.location;
      this.openAt = restaurantData.openAt;
      this.closeAt = restaurantData.closeAt;
      this.category = restaurantData.category;
      this.owner = restaurantData.owner;
      this.logo = restaurantData.logo;
      this.cover = restaurantData.cover;
      this.images = restaurantData.images;
      this.save = jest.fn().mockResolvedValue(this); // Renvoie l'instance pour la sauvegarde
    });

    const restaurant = await createRestaurant(restaurantData);

    expect(restaurant.logo).toBe('custom-logo.jpg');
    expect(restaurant.cover).toBe('custom-cover.jpg');
    expect(restaurant.images).toEqual(['img1.jpg', 'img2.jpg']);
    expect(restaurant.save).toHaveBeenCalled();
  });
});