export class MockPaymentProvider {
  async beginCheckout(packageId) {
    return { status: "disabled", packageId, provider: "mock" };
  }
}

// ProdamusProvider will implement beginCheckout(packageId) on the server-backed stage.
