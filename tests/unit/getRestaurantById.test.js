const restaurantService = require("../../services/restaurantService");
const Restaurant = require("../../models/Restaurant");

jest.mock("../../models/Restaurant"); // Mock du modèle Restaurant

describe("Restaurant Service - getRestaurantById", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Nettoyer les mocks après chaque test
  });

  it("devrait retourner un restaurant par ID avec les détails corrects", async () => {
    // Mock des données d'un restaurant à renvoyer
    const mockRestaurant = {
      _id: "1",
      name: "Restaurant 1",
      address: "Address 1",
      phoneNumber: "1122334455",
      logo: "logo1.jpg",
      cover: "cover1.jpg",
      images: ["image1.jpg", "image2.jpg"],
      category: { name: "Fast Food" },
      openAt: "08:00",
      closeAt: "22:00",
      owner: "ownerId1",
      isDeleted: "false"
    };

    // Simuler la fonction Restaurant.findById() pour renvoyer le restaurant mocké
    Restaurant.findById.mockResolvedValue(mockRestaurant);

    // Appeler la fonction à tester
    const restaurant = await restaurantService.getRestaurantById({
      _id: mockRestaurant._id,
    });

    // Vérifier que Restaurant.findById a bien été appelé avec le bon ID
    // expect(Restaurant.findById).toHaveBeenCalledWith({_id: restaurant._id, isDeleted: restaurant.isDeleted});

    // Vérifier que les détails du restaurant sont corrects
    expect(restaurant).toEqual(restaurant)
  });

  it("devrait retourner une erreur si le restaurant n'existe pas", async () => {
    // Simuler un retour null de Restaurant.findById() pour un ID inexistant
    const mockRestau = Restaurant.findById.mockResolvedValue(null);

    mockRestau.isDeleted = false;

    // Vérifier que l'appel à getRestaurantById lève une erreur
    await expect(
      restaurantService.getRestaurantById(mockRestau._id)
    ).rejects.toThrow("Restaurant non trouvé");

    // Vérifier que Restaurant.findById a bien été appelé avec le bon ID
    expect(Restaurant.findById).toHaveBeenCalledWith({
      _id: mockRestau._id,
      isDeleted: mockRestau.isDeleted,
    });
  });

  it("devrait gérer une erreur lors de la récupération du restaurant", async () => {
    // Simuler une erreur avec Restaurant.findById()
    const mockRestau = Restaurant.findById.mockRejectedValue(
      new Error("Erreur lors de la récupération du restaurant")
    );
    mockRestau.isDeleted = false;

    // Vérifier que l'appel à getRestaurantById lève une erreur
    await expect(
      restaurantService.getRestaurantById(mockRestau._id)
    ).rejects.toThrow("Erreur lors de la récupération du restaurant");

    // Vérifier que Restaurant.findById a bien été appelé avec le bon ID
    expect(Restaurant.findById).toHaveBeenCalledWith({
      _id: mockRestau._id,
      isDeleted: mockRestau.isDeleted,
    });
  });
});
