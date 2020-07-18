const axios = require('axios');


async function create_rule(action, ip) {
  try {
    const result = await axios.post(`https://api.cloudflare.com/client/v4/zones/${ZONE_IDENTIFIER}/firewall/rules`, [
      {
        action: action,
        description: `${action}_cloudflare_ban`,
        filter: {
          expression: `(ip.src in {${ip}})`
        }
      }
    ], {
      headers: {
        "X-Auth-Email": EMAIL,
        "X-Auth-Key": AUTH_KEY
      }
    })
    return result.data
  } catch (err) {
    console.log(err.response.data);
  }
}

async function update_filter(filter_id, expression) {
  try {
    const result = await axios.put(`https://api.cloudflare.com/client/v4/zones/${ZONE_IDENTIFIER}/filters/${filter_id}`,
      {
        id: filter_id,
        expression: expression
      }
      , {
        headers: {
          "X-Auth-Email": EMAIL,
          "X-Auth-Key": AUTH_KEY
        }
      })
    console.log(result.data.result)
  } catch (err) {
    console.log(err.response.data);
  }
}


function block(ip) {
  if (!BLOCK.ips.includes(ip)) {
   BLOCK.ips.push(ip)
   let result = update_filter(BLOCK.filter_id,`(ip.src in {${BLOCK.join(' ')}})`)
  } else {
    console.log("already in the list")
  }
}

function captcha(ip) {
  if (!CAPTCHA.ips.includes(ip)) {
    CAPTCHA.ips.push(ip)
  } else {
    console.log("already in the list")
  }
}

function js_challenge(ip) {
  if (!JS_CHALLENGE.ips.includes(ip)) {
    JS_CHALLENGE.ips.push(ip)
  } else {
    console.log("already in the list")
  }
}

function extract_ips(str) {
  const ind1 = str.indexOf("{")
  const ind2 = str.indexOf("}")
  str = str.slice(ind1 + 1, ind2)
  const ips = str.split(" ")
  return ips
}


async function start() {
  try {
    if (!(ZONE_IDENTIFIER && EMAIL && AUTH_KEY)) {
      console.log(AUTH_KEY)
      console.log("Error")
      return
    }
    let result = await axios.get(`https://api.cloudflare.com/client/v4/zones/${ZONE_IDENTIFIER}/firewall/rules`, {
      headers: {
        "X-Auth-Email": EMAIL,
        "X-Auth-Key": AUTH_KEY
      }
    })
    let firewall_rules = result.data.result
    console.log(firewall_rules)
    for (let rule of firewall_rules) {
      if (rule.description === "block_cloudflare_ban") {
        BLOCK.rule_id = rule.id
        BLOCK.filter_id = rule.filter.id
        BLOCK.ips = extract_ips(rule.filter.expression)
      }
      if (rule.description === "challenge_cloudflare_ban") {
        CAPTCHA.rule_id = rule.id
        CAPTCHA.filter_id = rule.filter.id
        CAPTCHA.ips = extract_ips(rule.filter.expression)
      }
      if (rule.description === "js_challenge_cloudflare_ban") {
        JS_CHALLENGE.rule_id = rule.id
        JS_CHALLENGE.filter_id = rule.filter.id
        JS_CHALLENGE.ips = extract_ips(rule.filter.expression)
      }
    }
    if (BLOCK.rule_id === null) {
      let res = await create_rule("block", "1.1.1.1")
      BLOCK.rule_id = res.id
      BLOCK.filter_id = res.filter.id
      BLOCK.ips = extract_ips(res.filter.expression)
      console.log(BLOCK)
    }
    if (CAPTCHA.rule_id === null) {
      let res = await create_rule("challenge", "1.1.1.2")
      CAPTCHA.rule_id = res.id
      CAPTCHA.filter_id = res.filter.id
      CAPTCHA.ips = extract_ips(res.filter.expression)
      console.log(CAPTCHA)
    }
    if (JS_CHALLENGE.rule_id === null) {
      let res = await  create_rule("js_challenge", "1.1.1.3")
      JS_CHALLENGE.rule_id = res.id
      JS_CHALLENGE.filter_id = res.filter.id
      JS_CHALLENGE.ips = extract_ips(res.filter.expression)
      console.log(JS_CHALLENGE)
    }
  } catch (err) {
    console.log(err);
  }
}

let ZONE_IDENTIFIER = null
let EMAIL = null
let AUTH_KEY = null
let ready = false
const BLOCK = { rule_id: null, filter_id: null, ips: [] }
const CAPTCHA = { rule_id: null, filter_id: null, ips: [] }
const JS_CHALLENGE = { rule_id: null, filter_id: null, ips: [] }
function set_zone_identifier(zone_id) {
  ZONE_IDENTIFIER = zone_id
}
function set_email(email) {
  EMAIL = email
}
function set_auth_key(auth_key) {
  AUTH_KEY = auth_key
}

module.exports = { set_zone_identifier, set_email, set_auth_key, start,block,captcha,js_challenge};