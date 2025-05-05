// 1. 환경 변수 로드
require("dotenv").config();

const nodemailer = require("nodemailer");

// 2. 환경 변수 확인
const { EMAIL_USER, EMAIL_PASS } = process.env;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("환경 변수 EMAIL_USER 또는 EMAIL_PASS가 설정되지 않았습니다.");
  process.exit(1); // 프로그램 종료
}

// 3. 이메일 발송을 위한 transporter 설정
const transporter = nodemailer.createTransport({
  host: "smtp.naver.com",
  port: 587,
  secure: false, // TLS 사용
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// 4. 이메일 발송 함수
const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "이메일 인증 코드",
    text: `인증 코드는 ${code} 입니다.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("이메일이 성공적으로 발송되었습니다.");
    return { success: true, message: "이메일 발송 완료" }; // 성공 응답
  } catch (error) {
    console.error("이메일 발송 실패:", error);
    return {
      success: false,
      message: "이메일 발송 실패",
      error: error.message,
    }; // 실패 응답
  }
};

// 5. 함수 외부에서 사용하기 위해 내보내기
module.exports = { sendVerificationEmail };
