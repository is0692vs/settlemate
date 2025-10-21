// 6桁の英数字を生成（数字とアルファベット大文字のみ，紛らわしい文字を除外）
// 0,1,I,Oを除外して紛らわしさを軽減
const CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}
