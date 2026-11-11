import { StripeService } from '../services/stripeService.js';

export class WebhookController {
  static async handleStripeWebhook(req, res) {
    const signature = req.headers['stripe-signature'];
    const result = await StripeService.handleWebhook(req.body, signature);
    res.json({ success: true, ...result });
  }
}
