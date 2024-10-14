module.exports = {
    Schema: class {
      constructor(schemaDefinition, options) {
        this.schemaDefinition = schemaDefinition;
        this.options = options;
      }
    },
    Types: {
      ObjectId: jest.fn().mockImplementation(() => ({
        isValid: jest.fn().mockReturnValue(true), // Mock the `isValid` method.
      })),
    },
    model: jest.fn(),
  };