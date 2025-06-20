/**
 * Firebase Cloud Function: Send Order Confirmation Email
 * Triggered on order creation in Firestore
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

// Initialize Firebase Admin
admin.initializeApp();

// Set SendGrid API key from Firebase environment config
sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendOrderConfirmationEmail = functions.firestore
    .document("orders/{orderId}")
    .onCreate(async (snap, context) => {
      const order = snap.data();

      const userEmail = order.email;
      const userName = order.name || "Customer";
      const orderId = order.orderId || context.params.orderId;

      const itemsList = order.items
          .map((item) => `${item.name} (x${item.qty})`)
          .join(", ");

      const msg = {
        to: userEmail,
        from: "daykart.services@gmail.com",
        subject: `🎉 Order Confirmation - ${orderId}`,
        html: `
        <h3>Hello ${userName},</h3>
        <p>Thank you for your order!</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Items:</strong> ${itemsList}</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
        <p>We’ll update you once it ships.</p>
        <br/>
        <p>Best regards,<br/>DayKart Team</p>
      `,
      };

      try {
        await sgMail.send(msg);
        console.log("✅ Email sent to", userEmail);
      } catch (error) {
        console.error("❌ Failed to send email:", error.toString());
      }
    });
