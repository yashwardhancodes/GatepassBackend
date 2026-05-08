import twilio from "twilio";

const getClient = () =>
  twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export const sendApprovalWhatsApp = async (
  mobile: string,
  visitorName: string,
  passId: string,
  allocatedMinutes: number
): Promise<void> => {
  const gatepassLink = `${process.env.FRONTEND_URL}/gatepass/${passId}`;

  // mobile is stored as 10 digits (e.g. 9876543210); prepend +91 for WhatsApp
  const to = `whatsapp:+91${mobile}`;
  const from = process.env.TWILIO_WHATSAPP_FROM!;

  const body =
    `✅ *Your Gatepass Has Been Approved!*\n\n` +
    `Hello ${visitorName},\n\n` +
    `Your visit request has been reviewed and *approved* by the admin.\n\n` +
    `📋 *Pass Details*\n` +
    `• Name: ${visitorName}\n` +
    `• Allocated Time: ${allocatedMinutes} minute(s)\n` +
    `• Pass ID: \`${passId}\`\n\n` +
    `🔗 *View & download your QR gatepass here:*\n` +
    `${gatepassLink}\n\n` +
    `Please show this QR code at the entrance. ` +
    `Your pass is valid for ${allocatedMinutes} minute(s) from the time of entry.\n\n` +
    `_— College Gatepass System_`;

  await getClient().messages.create({ from, to, body });
};
