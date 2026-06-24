import VerificationEmail from "@/email/verificationEmail";
import { render } from "@react-email/render";
import { transporter } from "../lib/nodemailer";

export async function sendVerificationEmail(
  email: string,
  name: string,
  verifyCode: string
) {
  try {
    const html = await render(
      VerificationEmail({
        name,
        verifyCode,
      })
    );

    await transporter.sendMail({
      from: `"TradeX" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your TradeX account",
      text: `Your TradeX verification code is ${verifyCode}`,
      html: html,
    });
    return { success: true, message: "Successfully sent verification email" };
  } catch (error) {
    console.log("Error sending verification email", error);
    return { success: false, message: "Failed to send verification email" };
  }
}