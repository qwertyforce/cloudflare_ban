async function main(){
    const x = require("./index")
    x.set_zone_identifier('zone_identifier')
    x.set_email("email")
    x.set_auth_key("auth_key")
    await x.start()
    let y =await x.block("4.4.4.4")
    console.log(y)
    let f =await x.captcha("4.4.4.4")
    console.log(f)
    let g =await x.js_challenge("4.4.4.4")
    console.log(g)
}
main()
