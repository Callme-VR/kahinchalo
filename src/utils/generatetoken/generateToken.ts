import jwt from "jsonwebtoken"
import  type {Response} from "express"

interface jwtpayload{
    id:string
}

export const generateToken=(userid:string,res:Response)=>{
     if(!process.env.JWT_SECRET){
          throw new Error("JWT_SECRET not COnfigured properly.")
     }
     const payload:jwtpayload={id:userid}
     const token=jwt.sign(payload,process.env.JWT_SECRET as string,{expiresIn:"30d"})
     res.cookie("jwt",token,{
          httpOnly:true,
          maxAge:30*24*60*60*1000,
          secure:process.env.NODE_ENV==="production",
          sameSite:"strict"
     })
     return token
}