# cloudflare_ban
```js
async function main(){
    const x = require("cloudflare_ban")
    x.set_zone_identifier('zone_identifier')
    x.set_email("email")
    x.set_auth_key("auth_key") //  /profile/api-tokens (Global API Key)
    await x.start()
    let a =await x.block("4.4.4.4")
    console.log(a)
    let b =await x.captcha("4.4.4.4")
    console.log(b)
    let c =await x.js_challenge("4.4.4.4")
    console.log(c)
    
    //let d =await x.remove_block("4.4.4.4")
    //console.log(d)
    //let e =await x.remove_captcha("4.4.4.4")
    //console.log(e)
    //let f =await x.remove_js_challenge("4.4.4.4")
    //console.log(f)
}
main()
```
