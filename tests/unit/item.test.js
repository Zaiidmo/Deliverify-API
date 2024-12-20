const request = require("supertest");
const express = require("express");
const app = express();
app.use(express.json());

const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  changeTheAvailabality,
} = require("../../controllers/manageItemController");
const authMiddleware = require("../../middlewares/authMiddleware");
const Item = require("../../models/Item");

// Mocking the Item model methods
jest.mock("../../models/Item");
jest.mock("../../middlewares/authMiddleware", () =>
  jest.fn((req, res, next) => next())
);

// Test data
const mockItems = [
  {
    _id: "1",
    name: "Pizza",
    description: "Delicious",
    price: 12,
    available: true,
  },
  { _id: "2", name: "Burger", description: "Tasty", price: 8, available: true },
];

// Define routes
app.get("/items", getItems);
app.get("/item/:id", getItemById);
app.post("/createItem", authMiddleware, createItem);
app.put("/updateItem/:id", authMiddleware, updateItem);
app.delete("/deleteItem/:id", authMiddleware, deleteItem);
app.put("/changeTheAvailabality/:id", authMiddleware, changeTheAvailabality);

describe("Manage Item Controller (without database)", () => {
  // Test GET /items
  describe("GET /items", () => {
    it("should return all items with status 200", async () => {
      Item.find.mockResolvedValue(mockItems); // Mocking the .find() method
      const res = await request(app).get("/items");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockItems);
    });

    it("should return 500 if an error occurs", async () => {
      Item.find.mockRejectedValue(new Error("Error fetching items")); // Simulate an error
      const res = await request(app).get("/items");
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Error fetching items");
    });
  });

  // Test GET /item/:id
  describe("GET /item/:id", () => {
    it("should return an item by id with status 200", async () => {
      const mockItem = mockItems[0];
      Item.findById.mockResolvedValue(mockItem); // Mocking .findById()
      const res = await request(app).get("/item/1");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockItem);
    });

    it("should return 404 if item not found", async () => {
      Item.findById.mockResolvedValue(null); // Simulate item not found
      const res = await request(app).get("/item/999");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Item not found");
    });

    it("should return 500 if an error occurs", async () => {
      Item.findById.mockRejectedValue(new Error("Error fetching item"));
      const res = await request(app).get("/item/1");
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Error fetching item");
    });
  });

  // Test POST /createItem
  describe("POST /createItem", () => {
    it("should create a new item with status 201", async () => {
      Item.prototype.save.mockResolvedValue(mockItems[0]); // Mocking .save()
      const res = await request(app).post("/createItem").send(mockItems[0]);
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Item created successfully");
    });

    it("should return 500 if an error occurs", async () => {
      Item.prototype.save.mockRejectedValue(new Error("Error creating item"));
      const res = await request(app)
        .post("/createItem")
        .send({ name: "Salad" });
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Error creating item");
    });
  });

  // Test PUT /updateItem/:id
  describe("PUT /updateItem/:id", () => {
    it("should update an item with status 200", async () => {
      const updatedItem = {
        name: "Updated Pizza",
        description: "Extra Cheese",
        price: 15,
      };
      Item.findByIdAndUpdate.mockResolvedValue(updatedItem); // Mocking findByIdAndUpdate()

      const res = await request(app).put("/updateItem/1").send(updatedItem);
      expect(res.status).toBe(200);
      expect(res.body.item).toEqual(updatedItem);
    });

    it("should return 404 if item not found", async () => {
      Item.findByIdAndUpdate.mockResolvedValue(null); // Simulate not found
      const res = await request(app)
        .put("/updateItem/999")
        .send({ name: "Updated" });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Item not found");
    });

    it("should return 500 if an error occurs", async () => {
      Item.findByIdAndUpdate.mockRejectedValue(
        new Error("Error updating item")
      );
      const res = await request(app)
        .put("/updateItem/1")
        .send({ name: "Updated" });
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Error updating item");
    });
  });

  // Test DELETE /deleteItem/:id
  describe("DELETE /deleteItem/:id", () => {
    it("should delete an item with status 200", async () => {
      Item.findByIdAndDelete.mockResolvedValue(mockItems[0]); // Mock findByIdAndDelete
      const res = await request(app).delete("/deleteItem/1");
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Item deleted successfully");
    });

    it("should return 404 if item not found", async () => {
      Item.findByIdAndDelete.mockResolvedValue(null); // Simulate not found
      const res = await request(app).delete("/deleteItem/999");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Item not found");
    });

    it("should return 500 if an error occurs", async () => {
      Item.findByIdAndDelete.mockRejectedValue(
        new Error("Error deleting item")
      );
      const res = await request(app).delete("/deleteItem/1");
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Error deleting item");
    });
  });

  // Test PUT /changeTheAvailabality/:id
  describe("PUT /changeTheAvailabality/:id", () => {
    it("should update the availability of an item with status 200", async () => {
      const mockItem = {
        _id: "1",
        available: true,
        save: jest.fn().mockResolvedValue(true), // Mock the save method
      };
      Item.findById.mockResolvedValue(mockItem); // Mock findById

      const res = await request(app).put("/changeTheAvailabality/1");

      expect(Item.findById).toHaveBeenCalledWith("1");
      expect(mockItem.save).toHaveBeenCalled();
      expect(mockItem.available).toBe(false); // The availability should toggle
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Item availability updated successfully");
    });

    it("should return 404 if item is not found", async () => {
      Item.findById.mockResolvedValue(null); // Simulate item not found

      const res = await request(app).put("/changeTheAvailabality/999");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Item not found");
    });

    it("should return 500 if an error occurs", async () => {
      Item.findById.mockRejectedValue(new Error("Database error")); // Simulate a database error

      const res = await request(app).put("/changeTheAvailabality/1");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Database error");
    });
  });
});
