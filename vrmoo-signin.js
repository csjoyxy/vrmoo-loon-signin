/** 
 * 魔趣(vrmoo.vip) 每日自动签到脚本 - Loon Plugin 版
 * 
 * 类型：cron (建议: 0 8 * * *)
 * 功能：使用持久化存储的 Cookie 自动执行每日签到
 */
const SIGN_URL = "https://www.vrmoo.vip/wp-json/b2/v1/userMission";
const COOKIE_KEY = "vrmoo_cookies";
const B2_KEY = "vrmoo_b2_token";
const WP_KEY = "vrmoo_wp_cookie";
const PHP_KEY = "vrmoo_phpsessid";
const WP_NAME_KEY = "vrmoo_wp_cookie_name";

function getCookieStr() {
    const s = $persistentStore.read(COOKIE_KEY);
    if (s && s.length > 20) return s;
    const b2 = $persistentStore.read(B2_KEY) || "";
    const wn = $persistentStore.read(WP_NAME_KEY) || "";
    const wv = $persistentStore.read(WP_KEY) || "";
    const ph = $persistentStore.read(PHP_KEY) || "";
    if (b2 || (wn && wv)) {
        const p = [];
        if (b2) p.push("b2_token=" + b2);
        if (wn && wv) p.push(wn + "=" + wv);
        if (ph) p.push("PHPSESSID=" + ph);
        p.push("night=0");
        p.push("gg_info=" + Math.floor(Date.now()/1000));
        return p.join("; ");
    }
    return "";
}

function doSignIn(cookie) {
    $httpClient.post(SIGN_URL, {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Origin": "https://www.vrmoo.vip",
        "Referer": "https://www.vrmoo.vip/",
        "Cookie": cookie
    }, "", function(err, resp, data) {
        if (err) {
            $notification.post("魔趣签到", "网络错误", String(err));
            $done(); return;
        }
        console.log("[vrmoo-signin] HTTP " + (resp ? resp.status : "?") + " | " + (data||"").substring(0,200));
        try {
            const j = JSON.parse(data);
            if (j.credit || j.mission) {
                const c = j.credit || (j.mission && j.mission.credit) || "?";
                const t = (j.mission && j.mission.my_credit) || "?";
                const d = (j.mission && j.mission.always) || "?";
                $notification.post("魔趣签到", "签到成功", "+" + c + "积分 | 总:" + t + " | 连续" + d + "天");
            } else {
                $notification.post("魔趣签到", "Cookie过期?", "请在Safari重新登录vrmoo.vip");
            }
        } catch(e) {
            if (data && data.includes("已经")) {
                $notification.post("魔趣签到", "今日已签到", "无需重复");
            } else {
                $notification.post("魔趣签到", "响应异常", (data||"").substring(0,100));
            }
        }
        $done();
    });
}

const ck = getCookieStr();
if (!ck) {
    $notification.post("魔趣签到", "无Cookie", "请在Safari打开vrmoo.vip登录");
    $done();
} else {
    doSignIn(ck);
}
