const restaurantService = require('../../services/restaurantService');
const Restaurant = require('../../models/Restaurant');

// Mock du modèle Restaurant pour Jest
jest.mock('../../models/Restaurant');

describe("Restaurant Service - deleteRestaurant", () => {

  afterEach(() => {
    jest.clearAllMocks(); // Nettoyer les mocks après chaque test
  });

  it("devrait mettre à jour le statut isDeleted à true pour un restaurant existant", async () => {
    // Mock des données du restaurant
    const mockRestaurant = {
      _id: "1",
      name: "Restaurant 1",
      address: "Address 1",
      phoneNumber: "1122334455",
      isDeleted: false,
      save: jest.fn(), // Mock de la méthode save
    };

    // Simuler la fonction Restaurant.findById() pour renvoyer un restaurant mocké
    Restaurant.findById.mockResolvedValue(mockRestaurant);

    // Appeler la fonction à tester
    const restaurant = await restaurantService.softDeleteRestaurant("1");

    // Vérifier que Restaurant.findById a bien été appelé
    expect(Restaurant.findById).toHaveBeenCalledWith("1");

    // Vérifier que le statut isDeleted a été mis à jour à true
    expect(restaurant.isDeleted).toBe(true);

    // Vérifier que la méthode save a bien été appelée
    expect(mockRestaurant.save).toHaveBeenCalled();
  });

  it("devrait renvoyer une erreur si le restaurant n'est pas trouvé", async () => {
    // Simuler un retour null pour un restaurant non trouvé
    Restaurant.findById.mockResolvedValue(null);

    await expect(restaurantService.softDeleteRestaurant("999")).rejects.toThrow(
      "Restaurant non trouvé"
    );

    // Vérifier que Restaurant.findById a bien été appelé
    expect(Restaurant.findById).toHaveBeenCalledWith("999");
  });

  it("devrait gérer une erreur lors de la suppression", async () => {
    // Simuler une erreur lors de l'appel à findById()
    Restaurant.findById.mockRejectedValue(new Error("Erreur de la base de données"));

    await expect(restaurantService.softDeleteRestaurant("1")).rejects.toThrow(
      "Erreur de la base de données"
    );

    // Vérifier que Restaurant.findById a bien été appelé
    expect(Restaurant.findById).toHaveBeenCalledWith("1");
  });
});
