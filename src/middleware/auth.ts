import { expressjwt as jwt } from 'express-jwt';
export let auth = jwt({
    algorithms:[ "HS256" ],
    secret:process.env.ACCESS_TOKEN_SECRET
})
