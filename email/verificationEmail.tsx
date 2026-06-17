import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Section,
} from "@react-email/components";

interface VerificationEmailProps {
  name: string;
  verifyCode: string;
}

export default function VerificationEmail({
  name,
  verifyCode,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />

      <Body
        style={{
          backgroundColor: "#f5f7fa",
          fontFamily: "Arial, sans-serif",
          padding: "20px",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            maxWidth: "600px",
            margin: "0 auto",
            padding: "40px",
            borderRadius: "12px",
          }}
        >
          <Heading
            style={{
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            Welcome to TradeX 📈
          </Heading>

          <Text>Hi {name},</Text>

          <Text>
            Thank you for joining TradeX. To activate your account and start
            exploring the platform, please verify your email using the code
            below.
          </Text>

          <Section
            style={{
              textAlign: "center",
              margin: "35px 0",
            }}
          >
            <Text
              style={{
                fontSize: "38px",
                fontWeight: "bold",
                letterSpacing: "8px",
                margin: "0",
              }}
            >
              {verifyCode}
            </Text>
          </Section>

          <Text>
            This verification code will expire in <strong>60 minutes</strong>.
          </Text>

          <Text>
            For your security, never share this code with anyone.
          </Text>

          <Text>
            If you did not create a TradeX account, you can safely ignore this
            email.
          </Text>

          <Text
            style={{
              marginTop: "30px",
              color: "#666",
            }}
          >
            Happy Trading,
            <br />
            <strong>TradeX Team</strong>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}