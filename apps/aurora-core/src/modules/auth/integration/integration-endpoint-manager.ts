/**
 * Class to keep track of all endpoint operationIds that can be accessed by integration users.
 */
export default class IntegrationEndpointManager {
  // Must be a singleton, as this object will be accessed by decorators
  private static instance: IntegrationEndpointManager;

  private integrationMethods: string[] = [];

  public static getInstance() {
    if (this.instance == null) {
      this.instance = new IntegrationEndpointManager();
    }
    return this.instance;
  }

  /**
   * Mark a method as one that can be used by integration users
   * @param methodName
   */
  public addIntegrationMethod(methodName: string): void {
    this.integrationMethods.push(methodName);
  }

  /**
   * Get all methods that have been marked as integration methods
   */
  public getIntegrationMethods(): string[] {
    return this.integrationMethods;
  }
}
