const BASE_URL = "https://www.vrmoo.vip";
const REFERER = `${BASE_URL}/gold`;
const USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1";

function notify(title, subtitle, message) {
  if (typeof $notification !== "undefined") {
    $notification.post(title, subtitle || "", message || "");
  }
}

function done(value) {
  if (typeof $done !== "undefined") {
    $done(value || {});
  }
}

function parseArgument(input) {
  const result = {};
  if (!input || typeof input !== "string") return result;

  input
    .replace(/^\?/, "")
    .split("&")
    .filter(Boolean)
    .forEach((pair) => {
      const index = pair.indexOf("=");
      if (index === -1) return;
      const key = decodeURIComponent(pair.slice(0, index)).trim();
      const value = decodeURIComponent(pair.slice(index + 1)).trim();
      if (key) result[key] = value;
    });

  return result;
}

function readConfig() {
  const args = parseArgument(typeof $argument === "string" ? $argument : "");
  const store = typeof $persistentStore !== "undefined" ? $persistentStore : null;

  const username =
    args.VRMOO_USERNAME ||
    args.username ||
    (store && (store.read("VRMOO_USERNAME") || store.read("vrmoo_username")));
  const password =
    args.VRMOO_PASSWORD ||
    args.password ||
    (store && (store.read("VRMOO_PASSWORD") || store.read("vrmoo_password")));

  if (!username || !password) {
    throw new Error("缺少账号密码：请在插件参数填写 VRMOO_USERNAME 和 VRMOO_PASSWORD");
  }

  return { username, password };
}

function request(options) {
  return new Promise((resolve, reject) => {
    $httpClient.post(options, (error, response, body) => {
      if (error) {
        reject(error);
        return;
      }

      let data = body;
      try {
        data = JSON.parse(body);
      } catch (_) {}

      const status = response && response.status;
      if (status && status >= 400) {
        const message = data && data.message ? data.message : body;
        reject(new Error(`HTTP ${status}: ${message}`));
        return;
      }

      resolve({ response, body, data });
    });
  });
}

function formBody(data) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join("&");
}

function defaultHeaders(token) {
  const headers = {
    Accept: "application/json, text/plain, */*",
    Origin: BASE_URL,
    Referer: REFERER,
    "User-Agent": USER_AGENT,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function login(username, password) {
  const payload = {
    nickname: "",
    username,
    password,
    code: "",
    img_code: "",
    invitation_code: "",
    token: "",
    smsToken: "",
    luoToken: "",
    confirmPassword: "",
    loginType: "",
  };

  const result = await request({
    url: `${BASE_URL}/wp-json/jwt-auth/v1/token`,
    headers: {
      ...defaultHeaders(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody(payload),
  });

  if (!result.data || !result.data.token) {
    throw new Error(`登录成功但没有返回 token：${JSON.stringify(result.data)}`);
  }

  return result.data;
}

async function getMissionStatus(token) {
  const result = await request({
    url: `${BASE_URL}/wp-json/b2/v1/getUserMission`,
    headers: {
      ...defaultHeaders(token),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody({ count: "10", paged: "1" }),
  });
  return result.data;
}

function isAlreadySigned(status) {
  return Boolean(status && status.mission && status.mission.credit);
}

async function signIn(token) {
  const result = await request({
    url: `${BASE_URL}/wp-json/b2/v1/userMission`,
    headers: defaultHeaders(token),
    body: "",
  });
  return result.data;
}

async function getGoldData(token) {
  const result = await request({
    url: `${BASE_URL}/wp-json/b2/v1/getUserGoldData`,
    headers: {
      ...defaultHeaders(token),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody({ user_id: "0" }),
  });
  return result.data;
}

(async () => {
  try {
    const { username, password } = readConfig();
    const loginData = await login(username, password);
    const token = loginData.token;
    const name = loginData.name || loginData.email || username;

    const status = await getMissionStatus(token);
    let message;

    if (isAlreadySigned(status)) {
      message = `今日已签到，奖励积分：${status.mission.credit}`;
    } else {
      const signResult = await signIn(token);
      const reward =
        signResult && signResult.mission && signResult.mission.credit
          ? signResult.mission.credit
          : "未知";
      message = `签到成功，奖励积分：${reward}`;
    }

    const gold = await getGoldData(token);
    const credit = gold && gold.credit !== undefined ? gold.credit : "未知";
    notify("VRMOO每日签到", name, `${message}；当前积分：${credit}`);
    done();
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    notify("VRMOO每日签到失败", "", message);
    done();
  }
})();
