/**
 * Notification Service (Placeholder)
 * Standard push/local notifications disabled for SDK 53 stability.
 */
export const notificationService = {
  async requestPermission() {
    console.log('Notification permissions requested (disabled)');
    return false;
  },

  async showLocalNotification(title, body) {
    console.log(`[Notification Placeholder] ${title}: ${body}`);
  },
};
