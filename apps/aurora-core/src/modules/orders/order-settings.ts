export interface OrderSettings {
  Orders: boolean;
  'Orders.DefaultTimeoutSeconds': number;
  /**
   * @deprecated Please migrate to the new IntegrationUsers-based approach. See
   * https://github.com/GEWIS/aurora-core/blob/develop/src/modules/auth/integration/README.md.
   */
  'Orders.WebhookPublicKeyURL': string;
  /**
   * @deprecated Please migrate to the new IntegrationUsers-based approach. See
   * https://github.com/GEWIS/aurora-core/blob/develop/src/modules/auth/integration/README.md.
   */
  'Orders.WebhookPublicKeyExpirySeconds': number;
}

export const OrderSettingsDefault: OrderSettings = {
  Orders: true,
  'Orders.DefaultTimeoutSeconds': 120,
  'Orders.WebhookPublicKeyURL': '',
  'Orders.WebhookPublicKeyExpirySeconds': 60 * 60,
};
