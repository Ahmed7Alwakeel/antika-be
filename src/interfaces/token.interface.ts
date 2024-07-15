export default  interface IToken extends Document{
    token:string
    user:any
	tokenExpires: Date,
    compareToken(t1: string, t2: string): Promise<string>
}