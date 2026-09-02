/* =======================================================================
   かんたんロック
   -----------------------------------------------------------------------
   初めての端末ではパスワード入力を求め、一度通った端末では次から省く。
   （この端末の localStorage に合図を残すだけの仕組み）

   ■ できること
     ・知らない人がURLを開いても、そのままでは中身が見えない
   ■ できないこと
     ・ページのソースやデータファイルを直接読まれるのは防げない
       本気で守るなら、認証機能のあるホスティングに置くこと

   ■ パスワードを変えるには
     1. ブラウザでこのアプリを開き、開発者ツールのコンソールで
          makeAuthHash("新しいパスワード")
        を実行する
     2. 表示された1行を、下の AUTH_HASH に貼り替える
     3. 保存して push する（各端末は次回1回だけ再入力が必要）
   ======================================================================= */

const AUTH_SALT  = "linuc101-v1";
const AUTH_HASH  = "405644e12cbcd497a9feadb2276ee5fbc8477a4871ff5eafb993e34dcb736b82";
const AUTH_ROUNDS = 20000;                   // 総当たりを少し重くするための繰り返し
const AUTH_KEY   = "linuc101.auth.v1";

/* ---------------- SHA-256（file:// でも動くよう自前で用意） ---------------- */
const SHA_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function utf8Bytes(str) {
  const out = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0xd800 || c >= 0xe000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else {
      const c2 = str.charCodeAt(++i);
      const cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
      out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    }
  }
  return out;
}

function sha256Hex(msg) {
  const b = utf8Bytes(msg);
  const bitLen = b.length * 8;
  b.push(0x80);
  while (b.length % 64 !== 56) b.push(0);
  b.push(0, 0, 0, 0, (bitLen >>> 24) & 255, (bitLen >>> 16) & 255, (bitLen >>> 8) & 255, bitLen & 255);

  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
             0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));

  for (let i = 0; i < b.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = (b[i + t * 4] << 24) | (b[i + t * 4 + 1] << 16) | (b[i + t * 4 + 2] << 8) | b[i + t * 4 + 3];
    }
    for (let t = 16; t < 64; t++) {
      const x = w[t - 15], y = w[t - 2];
      const s0 = rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
      const s1 = rotr(y, 17) ^ rotr(y, 19) ^ (y >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }
    let a = H[0], bb = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA_K[t] + w[t]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & bb) ^ (a & c) ^ (bb & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + bb) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, "0")).join("");
}

// パスワード → 保存用のハッシュ
function authHash(password) {
  let h = sha256Hex(AUTH_SALT + ":" + password);
  for (let i = 0; i < AUTH_ROUNDS; i++) h = sha256Hex(h);
  return h;
}

// パスワードを変えるときにコンソールで使う
function makeAuthHash(password) {
  const h = authHash(password);
  const line = 'const AUTH_HASH  = "' + h + '";';
  console.log("auth.js の AUTH_HASH をこの行に置き換えてください:\n" + line);
  return line;
}

/* ---------------- ロックの開け閉め ---------------- */
function authRemembered() {
  try { return localStorage.getItem(AUTH_KEY) === AUTH_HASH; } catch (e) { return false; }
}

function authUnlock(remember) {
  if (remember) { try { localStorage.setItem(AUTH_KEY, AUTH_HASH); } catch (e) { /* noop */ } }
  document.body.classList.remove("locked");
  const el = document.getElementById("lockNote");
  if (el) el.hidden = false;
}

function authRelock() {
  try { localStorage.removeItem(AUTH_KEY); } catch (e) { /* noop */ }
  location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  if (authRemembered()) { authUnlock(false); return; }

  const form  = document.getElementById("lockForm");
  const input = document.getElementById("lockInput");
  const msg   = document.getElementById("lockMsg");
  if (!form) return;

  setTimeout(() => input.focus(), 100);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const pw = input.value;
    if (!pw) return;

    msg.textContent = "確認中…";
    msg.className = "lock-msg";
    // 計算に少し時間がかかるので、画面を更新してから走らせる
    setTimeout(() => {
      if (authHash(pw) === AUTH_HASH) {
        authUnlock(document.getElementById("lockRemember").checked);
      } else {
        input.value = "";
        msg.textContent = "パスワードが違います。";
        msg.className = "lock-msg is-ng";
        input.focus();
      }
    }, 30);
  });
});
