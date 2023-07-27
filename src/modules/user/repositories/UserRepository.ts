import { Request, Response} from 'express'
import {pool} from '../../../mysql';
import { v4 as uuidv4 }from 'uuid';
import {compare, hash} from "bcrypt";
import {sign} from "jsonwebtoken"
import { verify } from 'jsonwebtoken';


class UserRepository {
    create( request: Request, response:Response){
    const { name, email, password} = request.body;
    pool.getConnection((err: any, connection: any) => {
        hash(password, 10, (err, hash) => {
            if(err){
                return response.status (500).json(err)
    }

    connection.query(
        'SELECT email FROM users WHERE email = ?',
        [email],
        (error: any, result: any, fields: any) => {
            if (error) {
            connection.release();
            return response.status(500).json(error);
            }
        
            if (result.length > 0) {
            connection.release();
            return response.status(409).json({message: "E-mail já existe"});
    }


    connection.query(
        'INSERT INTO users (user_id, name, email, password) VALUES(?,?,?,?)',
        [uuidv4(), name, email, hash],
        (error:any, result:any, fileds:any) =>{
        connection.release();
        if (error) {
            return response.status (400).json(error)
        }
        response.status (200).json({message: 'Usuario criado com sucesso'});
        }
    );
});
}) 
})
}

login( request: Request, response:Response) {
    const {email, password} = request.body;
    pool.getConnection((err: any, connection: any) => {

    connection.query(
    'SELECT * FROM users WHERE  email = ?',
    [ email],
    (error:any, results:any, fileds:any) =>{
        connection.release();
        if (error) {
            return response.status (400).json({error:"Erro na sua Autenticação"})
        }

        if (results.length === 0) {
            return response.status(400).json({error: "Usuário não encontrado"});
            }
        
        compare(password, results[0].password, (err,result)=> {
            if (err) {
            return response.status (400).json({error:"Erro na sua Autenticação"})
            }
            if(result){
            const token = sign ({
            id:results[0].user_id,
            email: results[0].email

            }, process.env.SECRET as string, {expiresIn: "1d"})
        
            return response.status (200).json({token:token, message: 'Autenticado com sucesso'})
        }
    })
    } 
)
})
}
getUser(request: any, response: any){
const decode: any = verify(request.headers.authorization,process.env.SECRET as string);
if(decode.email){
    pool.getConnection((err, conn) => {
        conn.query(
            'SELECT * FROM users WHERE  email= ?',
            [ decode.email],
            (error, resultado, fileds) =>{
                conn.release();
                if (error) {
                    return response.status (400).send({
                        error: error,
                        response:null  
                    })
                }
                

                return response.status (200).json({ 
                    user: {
                        nome: resultado[0].name,
                        email: resultado[0].email,
                        id: resultado[0].user_id
                    }
                })
            }
        )
    })
}
}
}
            
export {UserRepository};